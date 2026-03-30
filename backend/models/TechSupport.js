const mongoose = require("mongoose");

const techSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  category: { type: String, enum: ["wifi", "lab", "software", "hardware", "portal", "other"] },
  description: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("TechSupport", techSchema);
