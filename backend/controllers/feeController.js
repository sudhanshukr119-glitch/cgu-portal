const Fee = require("../models/Fee");

exports.getFees = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Fee.find(filter).sort({ dueDate: 1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    res.json(await Fee.create(req.body));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFee = async (req, res) => {
  try {
    res.json(await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
