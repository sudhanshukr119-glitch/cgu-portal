const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    res.json(await Notification.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createNotification = async (req, res) => {
  try {
    res.json(await Notification.create({ ...req.body, postedBy: req.user.id, date: new Date() }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
