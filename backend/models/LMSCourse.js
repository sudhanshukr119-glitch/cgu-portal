const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  subject:     { type: String, required: true },
  department:  { type: String, default: "" },
  semester:    { type: Number, default: 0 },        // 0 = all semesters
  thumbnail:   { type: String, default: "" },        // base64 or URL
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacherName: { type: String },
  isPublished: { type: Boolean, default: false },
  tags:        [{ type: String }],
}, { timestamps: true, toJSON: { virtuals: true } });

// virtual counts populated by controller
courseSchema.virtual("lessonCount",   { ref: "LMSLesson",      localField: "_id", foreignField: "course", count: true });
courseSchema.virtual("testCount",     { ref: "LMSTest",        localField: "_id", foreignField: "course", count: true });
courseSchema.virtual("assignmentCount",{ ref: "LMSAssignment", localField: "_id", foreignField: "course", count: true });

module.exports = mongoose.model("LMSCourse", courseSchema);
