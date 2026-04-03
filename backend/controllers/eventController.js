const Event = require("../models/Event");

exports.getEvents = async (req, res) => {
  try {
    res.json(await Event.find().sort({ date: 1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEvent = async (req, res) => {
  try {
    res.json(await Event.create({ ...req.body, postedBy: req.user._id, rsvps: [] }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const already = event.rsvps.find(r => r.userId?.toString() === req.user._id.toString());
    if (already) {
      event.rsvps = event.rsvps.filter(r => r.userId?.toString() !== req.user._id.toString());
    } else {
      if (event.maxSeats && event.rsvps.length >= event.maxSeats)
        return res.status(400).json({ message: "Event is full" });
      event.rsvps.push({ userId: req.user._id, name: req.body.name || req.user.name });
    }
    await event.save();
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
