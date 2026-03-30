const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// Verify JWT and attach full user to request
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) return res.status(401).json({ message: "Account not found or inactive" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based access: requireRole("admin") or requireRole("admin","teacher")
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(" or ")}` });
  next();
};

// Permission-based access: requirePermission("manage:students")
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!req.user.permissions.includes(permission))
    return res.status(403).json({ message: `Missing permission: ${permission}` });
  next();
};

// Log activity to DB (non-blocking)
const logActivity = (action, module) => async (req, res, next) => {
  res.on("finish", async () => {
    if (!req.user) return;
    try {
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action,
        module,
        details: JSON.stringify({ method: req.method, path: req.path, body: req.body }),
        ipAddress: req.ip || req.connection?.remoteAddress || "",
        status: res.statusCode < 400 ? "success" : "failed",
      });
    } catch (_) {}
  });
  next();
};

// Students can only access their own data unless admin/teacher
const ownDataOnly = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "teacher") return next();
  const targetId = req.params.studentId || req.params.userId || req.params.id;
  if (targetId && targetId !== req.user._id.toString())
    return res.status(403).json({ message: "You can only access your own data" });
  next();
};

module.exports = { auth, requireRole, requirePermission, logActivity, ownDataOnly };
