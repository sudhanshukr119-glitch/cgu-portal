const mongoose = require("mongoose");

const marketplaceMessageSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Marketplace", required: true },
  senderId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName:{ type: String },
  text:      { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("MarketplaceMessage", marketplaceMessageSchema);
