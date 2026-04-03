const mongoose = require("mongoose");

const AiQueryLogSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userRole:    { type: String },
    context:     { type: String },
    query:       { type: String, required: true },
    flagReason:  { type: String },           // why it was flagged / blocked
    blocked:     { type: Boolean, default: false },
    ipAddress:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiQueryLog", AiQueryLogSchema);
