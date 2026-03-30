const mongoose = require("mongoose");

const dispensarySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  symptoms: String,
  prescription: String,
  doctorNote: String,
  status: { type: String, enum: ["pending", "reviewed", "closed"], default: "pending" },
  visitDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Dispensary", dispensarySchema);
