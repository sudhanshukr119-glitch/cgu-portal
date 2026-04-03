const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  name:    { type: String },
  type:    { type: String },   // pdf, video, link, image
  url:     { type: String },   // base64 or external URL
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: "LMSCourse", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  content:     { type: String, default: "" },   // rich text / markdown
  order:       { type: Number, default: 0 },
  duration:    { type: String, default: "" },   // e.g. "45 min"
  attachments: [attachmentSchema],
  videoUrl:    { type: String, default: "" },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("LMSLesson", lessonSchema);
