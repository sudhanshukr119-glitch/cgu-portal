const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  amount: Number,
  type: { type: String, enum: ["tuition", "hostel", "exam", "other"] },
  status: { type: String, enum: ["paid", "pending", "overdue"], default: "pending" },
  dueDate: Date,
  paidDate: Date,
  semester: String,
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
