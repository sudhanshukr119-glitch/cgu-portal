const Submission = require("../models/Submission");

exports.getSubmissions = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Submission.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSubmission = async (req, res) => {
  try {
    const existing = await Submission.findOne({ assignmentId: req.body.assignmentId, studentId: req.user.id });
    if (existing) return res.status(400).json({ message: "Already submitted" });
    res.json(await Submission.create({ ...req.body, studentId: req.user.id, status: "submitted" }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.gradeSubmission = async (req, res) => {
  try {
    res.json(await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
