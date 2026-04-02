const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  date:        { type: String, required: true }, // "YYYY-MM-DD"
  seconds:     { type: Number, default: 0 },     // total seconds studied today
}, { timestamps: true });

// one record per student per day
studySessionSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudySession", studySessionSchema);
