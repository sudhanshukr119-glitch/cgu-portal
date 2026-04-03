const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName:  { type: String },
  answer:       { type: String, default: "" },      // text answer
  fileUrl:      { type: String, default: "" },       // base64 attachment
  fileName:     { type: String, default: "" },
  submittedAt:  { type: Date, default: Date.now },
  grade:        { type: Number, default: null },     // marks awarded
  feedback:     { type: String, default: "" },
  graded:       { type: Boolean, default: false },
}, { _id: true });

const lmsAssignmentSchema = new mongoose.Schema({
  course:       { type: mongoose.Schema.Types.ObjectId, ref: "LMSCourse", required: true },
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  instructions: { type: String, default: "" },
  dueDate:      { type: Date },
  maxMarks:     { type: Number, default: 100 },
  attachments:  [{ name: String, url: String, type: String }],
  submissions:  [submissionSchema],
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublished:  { type: Boolean, default: false },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("LMSAssignment", lmsAssignmentSchema);
