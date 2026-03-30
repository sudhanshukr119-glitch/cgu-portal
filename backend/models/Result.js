const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: String,
  rollNo:      String,
  class:       String,
  semester:    Number,
  subject:     { type: String, required: true },
  examType:    { type: String, enum: ["mid-term", "end-term", "quiz", "assignment", "practical"], default: "end-term" },
  marksObtained: { type: Number, required: true },
  totalMarks:    { type: Number, required: true },
  grade:         String,
  remarks:       String,
  isPublished:   { type: Boolean, default: false },
  publishedAt:   Date,
  enteredBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  academicYear:  String,
}, { timestamps: true });

// Auto-calculate grade
resultSchema.pre("save", function () {
  const pct = (this.marksObtained / this.totalMarks) * 100;
  if (pct >= 90) this.grade = "A+";
  else if (pct >= 80) this.grade = "A";
  else if (pct >= 70) this.grade = "B+";
  else if (pct >= 60) this.grade = "B";
  else if (pct >= 50) this.grade = "C+";
  else if (pct >= 40) this.grade = "C";
  else this.grade = "F";
});

module.exports = mongoose.model("Result", resultSchema);
