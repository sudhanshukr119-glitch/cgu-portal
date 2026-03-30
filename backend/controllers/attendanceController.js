const Attendance = require("../models/Attendance");

exports.getAttendance = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Attendance.find(filter).sort({ date: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAttendance = async (req, res) => {
  try {
    const doc = await Attendance.create({ ...req.body, markedBy: req.user.id });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkMark = async (req, res) => {
  try {
    const records = req.body.records;
    if (!records || !records.length)
      return res.status(400).json({ message: "No records provided" });
    const docs = await Attendance.insertMany(
      records.map(r => ({ ...r, markedBy: req.user.id })),
      { ordered: false }
    );
    res.json({ success: true, count: docs.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
