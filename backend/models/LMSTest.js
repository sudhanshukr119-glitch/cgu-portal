const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       [{ type: String }],              // 4 options
  correctIndex:  { type: Number, required: true }, // 0-3
  explanation:   { type: String, default: "" },
}, { _id: true });

const attemptSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers:     [{ type: Number }],   // selected option index per question
  score:       { type: Number },
  total:       { type: Number },
  percentage:  { type: Number },
  submittedAt: { type: Date, default: Date.now },
}, { _id: false });

const testSchema = new mongoose.Schema({
  course:       { type: mongoose.Schema.Types.ObjectId, ref: "LMSCourse", required: true },
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  questions:    [questionSchema],
  duration:     { type: Number, default: 30 },    // minutes
  passMark:     { type: Number, default: 50 },    // percentage
  maxAttempts:  { type: Number, default: 3 },
  attempts:     [attemptSchema],
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublished:  { type: Boolean, default: false },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("LMSTest", testSchema);
