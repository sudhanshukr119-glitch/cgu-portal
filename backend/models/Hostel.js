const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  roomNo: String,
  block: String,
  issueType: { type: String, enum: ["electrical", "plumbing", "furniture", "cleaning", "other"] },
  description: String,
  status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
  resolvedAt: Date,
  studentConfirmed: { type: Boolean, default: false },
  studentFeedback: { type: String, enum: ["completed", "in-progress", "not-done", ""], default: "" },
  confirmedAt: Date,
  progressUpdates: [{
    note: String,
    progress: { type: Number, default: 0 }, // 0-100 student-reported progress
    addedAt: { type: Date, default: Date.now },
  }],
  studentProgress: { type: Number, default: 0 }, // latest student-reported progress %
}, { timestamps: true });

module.exports = mongoose.model("Hostel", hostelSchema);
