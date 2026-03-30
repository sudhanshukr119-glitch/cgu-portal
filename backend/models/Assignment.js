const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: String,
  subject: String,
  teacherId: String,
  class: String,
  dueDate: Date,
  maxMarks: Number,
  description: String
});

module.exports = mongoose.model("Assignment", assignmentSchema);