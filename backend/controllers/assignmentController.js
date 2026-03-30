const Assignment = require("../models/Assignment");

exports.getAssignments = async (req, res) => {
  try {
    res.json(await Assignment.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAssignment = async (req, res) => {
  try {
    res.json(await Assignment.create({ ...req.body, teacherId: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
