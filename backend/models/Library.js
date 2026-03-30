const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  bookTitle: String,
  author: String,
  isbn: String,
  requestType: { type: String, enum: ["issue", "return", "renew"], default: "issue" },
  status: { type: String, enum: ["pending", "approved", "returned", "rejected"], default: "pending" },
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Library", librarySchema);
