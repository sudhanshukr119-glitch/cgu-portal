const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName:  String,
  userRole:  String,
  action:    { type: String, required: true },
  module:    { type: String, required: true },
  details:   { type: String, default: "" },
  ipAddress: { type: String, default: "" },
  status:    { type: String, enum: ["success", "failed", "warning"], default: "success" },
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
