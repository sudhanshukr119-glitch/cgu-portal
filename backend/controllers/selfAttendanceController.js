const SelfAttendance = require("../models/SelfAttendance");

exports.getSelf = async (req, res) => {
  try {
    res.json(await SelfAttendance.find({ studentId: req.user.id }).sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.upsertSelf = async (req, res) => {
  try {
    const { subject, date, status } = req.body;
    const doc = await SelfAttendance.findOneAndUpdate(
      { studentId: req.user.id, subject, date },
      { status },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
