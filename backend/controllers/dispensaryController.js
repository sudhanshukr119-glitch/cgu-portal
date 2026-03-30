const Dispensary = require("../models/Dispensary");

exports.getRecords = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Dispensary.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRecord = async (req, res) => {
  try {
    res.json(await Dispensary.create({ ...req.body, studentId: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateRecord = async (req, res) => {
  try {
    res.json(await Dispensary.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
