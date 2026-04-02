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

// Auto-calculate grade on save AND update
const calcGrade = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  return "F";
};

resultSchema.pre("save", function () {
  const pct = (this.marksObtained / this.totalMarks) * 100;
  this.grade = calcGrade(pct);
});

resultSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update.marksObtained !== undefined && update.totalMarks !== undefined) {
    const pct = (update.marksObtained / update.totalMarks) * 100;
    update.grade = calcGrade(pct);
  }
});

module.exports = mongoose.model("Result", resultSchema);
