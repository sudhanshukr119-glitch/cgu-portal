const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromName: String,
  toName: String,
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Chat", messageSchema);
