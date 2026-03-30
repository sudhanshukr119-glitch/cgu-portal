const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: String,
  items: [{ name: String, price: Number, qty: Number }],
  totalAmount: Number,
  mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"] },
  status: { type: String, enum: ["ordered", "ready", "delivered"], default: "ordered" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Food", foodSchema);
