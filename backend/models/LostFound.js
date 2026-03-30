const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema({
  postedBy: String,
  userId: String,
  type: { type: String, enum: ["lost", "found"], required: true },
  itemName: String,
  description: String,
  location: String,
  contact: String,
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("LostFound", lostFoundSchema);
