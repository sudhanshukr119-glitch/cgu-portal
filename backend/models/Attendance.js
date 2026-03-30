const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  subject: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present", "absent", "late"], default: "present" },
  markedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
