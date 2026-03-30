const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignmentId: String,
  studentId: String,
  studentName: String,
  content: String,
  marks: Number,
  feedback: String,
  status: String
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);