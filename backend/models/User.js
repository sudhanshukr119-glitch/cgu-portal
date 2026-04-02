const mongoose = require("mongoose");

const PERMISSIONS = {
  admin: [
    "manage:users", "manage:students", "manage:faculty", "manage:departments",
    "manage:courses", "manage:fees", "manage:system", "manage:roles",
    "view:analytics", "view:logs", "manage:notices", "manage:timetable",
    "approve:requests", "manage:exams", "manage:results"
  ],
  teacher: [
    "manage:attendance", "manage:assignments", "manage:results",
    "view:students", "view:analytics", "send:notices",
    "approve:leave", "manage:timetable", "view:notifications"
  ],
  student: [
    "view:profile", "view:attendance", "view:results", "view:timetable",
    "submit:assignments", "view:notifications", "apply:leave",
    "view:documents", "use:chatbot", "view:fees"
  ]
};

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["admin", "teacher", "student"], required: true },
  avatar: { type: String, default: "" },  // base64 or URL photo
  phone:    { type: String, default: "" },
  gender:   { type: String, enum: ["male", "female", "other", ""] , default: "" },
  address:  { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  lastLogin:{ type: Date },

  // Student fields
  rollNo:      { type: String, default: "" },
  class:       { type: String, default: "" },
  department:  { type: String, default: "" },
  semester:    { type: Number, default: 1 },
  batch:       { type: String, default: "" },
  feeStatus:   { type: String, enum: ["paid", "pending", "overdue", ""], default: "" },
  parentPhone: { type: String, default: "" },

  // Teacher fields
  subject:       { type: String, default: "" },
  designation:   { type: String, default: "" },
  qualification: { type: String, default: "" },
  experience:    { type: Number, default: 0 },
  isHOD:         { type: Boolean, default: false },

  // RBAC
  permissions: { type: [String], default: [] },

  // Preferences
  theme: { type: String, enum: ["dark", "light"], default: "dark" },
  notificationsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-assign permissions based on role
userSchema.pre("save", function () {
  if (this.isModified("role") || this.isNew) {
    this.permissions = PERMISSIONS[this.role] || [];
  }
});

userSchema.methods.hasPermission = function (perm) {
  return this.permissions.includes(perm);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
module.exports.PERMISSIONS = PERMISSIONS;
