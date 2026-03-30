const mongoose = require("mongoose");

const selfAttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  status: { type: String, enum: ["present", "absent"], required: true },
}, { timestamps: true });

// one entry per student+subject+date
selfAttendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("SelfAttendance", selfAttendanceSchema);
