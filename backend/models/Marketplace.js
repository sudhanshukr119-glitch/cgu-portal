const mongoose = require("mongoose");

const marketplaceSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  price:    { type: Number, required: true },
  category: { type: String, enum: ["Books","Electronics","Stationery","Clothing","Furniture","Other"], default: "Other" },
  desc:     { type: String, required: true, trim: true },
  image:    { type: String },          // base64 or URL
  seller:   { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dept:     { type: String },
  sold:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Marketplace", marketplaceSchema);
