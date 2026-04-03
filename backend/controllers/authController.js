const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    // Block admin self-registration — admin accounts can only be created by existing admins
    if (req.body.role === "admin")
      return res.status(403).json({ message: "Admin accounts cannot be self-registered. Contact your system administrator." });

    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(409).json({ message: "Email already registered" });
    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    const hashed = await bcrypt.hash(req.body.password, 12);
    const user = new User({ ...req.body, password: hashed });
    await user.save();
    res.status(201).json({ message: "User created", user: user.toSafeObject() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await ActivityLog.create({
        user: user._id, userName: user.name, userRole: user.role,
        action: "LOGIN_FAILED", module: "auth",
        details: `Failed login attempt for ${email}`, status: "failed"
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      user: user._id, userName: user.name, userRole: user.role,
      action: "LOGIN", module: "auth",
      details: `Successful login`, status: "success"
    });

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user.toSafeObject());
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "gender", "address", "avatar", "theme", "notificationsEnabled"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
