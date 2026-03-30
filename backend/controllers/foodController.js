const Food = require("../models/Food");

exports.getOrders = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Food.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.placeOrder = async (req, res) => {
  try {
    res.json(await Food.create({ ...req.body, studentId: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateOrder = async (req, res) => {
  try {
    res.json(await Food.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
