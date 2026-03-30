const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: String,
  studentRoll: String,
  class:       String,
  type:        { type: String, enum: ["sick", "casual", "emergency", "academic", "bonafide", "certificate"], required: true },
  reason:      { type: String, required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  days:        Number,
  status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewerName:String,
  reviewNote:  String,
  reviewedAt:  Date,
  attachments: [String],
}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveSchema);
