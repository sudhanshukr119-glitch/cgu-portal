const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");

// Admin: get all users with filters
exports.getUsers = async (req, res) => {
  try {
    const { role, department, isActive, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { rollNo: { $regex: search, $options: "i" } },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: create user
exports.createUser = async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(req.body.password || "password123", 12);
    const user = new User({ ...req.body, password: hashed });
    await user.save();
    await ActivityLog.create({
      user: req.user._id, userName: req.user.name, userRole: req.user.role,
      action: "CREATE_USER", module: "users",
      details: `Created ${user.role}: ${user.name} (${user.email})`
    });
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: update any user
exports.updateUser = async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    if (password) updates.password = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: deactivate user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    await ActivityLog.create({
      user: req.user._id, userName: req.user.name, userRole: req.user.role,
      action: "DEACTIVATE_USER", module: "users",
      details: `Deactivated: ${user.name}`
    });
    res.json({ message: "User deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student/user: update own avatar photo
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: "No avatar provided" });
    // Limit base64 size to ~2MB
    if (avatar.length > 2 * 1024 * 1024 * 1.37)
      return res.status(400).json({ message: "Image too large. Max 2MB." });
    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true }).select("-password");
    res.json({ avatar: user.avatar });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get students list (accessible to all authenticated users)
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true })
      .select("name email department class rollNo batch phone")
      .sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get faculty list (accessible to all authenticated users)
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "teacher", isActive: true })
      .select("name email subject designation department experience avatar phone isHOD")
      .sort({ department: 1, name: 1 });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: system-wide analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalAdmin, activeStudents] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "student", isActive: true }),
    ]);

    const departments = await User.aggregate([
      { $match: { role: "student", isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentLogins = await ActivityLog.find({ action: "LOGIN" })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name role avatar");

    res.json({ totalStudents, totalFaculty, totalAdmin, activeStudents, departments, recentLogins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: activity logs
exports.getLogs = async (req, res) => {
  try {
    const { module, userRole, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (userRole) filter.userRole = userRole;
    if (status) filter.status = status;
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
