const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, enum: ["fest", "workshop", "seminar", "sports", "cultural", "exam", "other"], default: "other" },
  date: Date,
  time: String,
  venue: String,
  organizer: String,
  maxSeats: Number,
  rsvps: [{ userId: String, name: String }],
  postedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
