const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, enum: ["info", "warning", "success", "urgent"], default: "info" },
  audience: String,
  targetRole: { type: String, default: "" }, // e.g. "admin" to show only to admins
  module: { type: String, default: "" },     // e.g. "hostel" for source tracking
  refId: { type: String, default: "" },      // reference doc id
  postedBy: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
