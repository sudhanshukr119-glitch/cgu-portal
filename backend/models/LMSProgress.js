const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  student:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course:           { type: mongoose.Schema.Types.ObjectId, ref: "LMSCourse", required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "LMSLesson" }],
  percentage:       { type: Number, default: 0 },
  lastAccessed:     { type: Date, default: Date.now },
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("LMSProgress", progressSchema);
