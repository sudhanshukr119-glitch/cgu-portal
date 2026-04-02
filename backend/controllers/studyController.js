const StudySession = require("../models/StudySession");

// Save / update today's study time for the logged-in student
exports.saveSession = async (req, res) => {
  try {
    const date = new Date().toISOString().split("T")[0];
    const { seconds } = req.body;
    if (!seconds || seconds <= 0)
      return res.status(400).json({ message: "Invalid seconds" });

    const session = await StudySession.findOneAndUpdate(
      { studentId: req.user.id, date },
      { $inc: { seconds }, studentName: req.user.name },
      { upsert: true, new: true }
    );
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get today's leaderboard — all students sorted by seconds desc
exports.getLeaderboard = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const sessions = await StudySession.find({ date }).sort({ seconds: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get logged-in student's own session for today
exports.getMySession = async (req, res) => {
  try {
    const date = new Date().toISOString().split("T")[0];
    const session = await StudySession.findOne({ studentId: req.user.id, date });
    res.json(session || { seconds: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
