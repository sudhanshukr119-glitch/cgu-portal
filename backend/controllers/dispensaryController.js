const Dispensary = require("../models/Dispensary");

exports.getRecords = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user._id } : {};
    res.json(await Dispensary.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRecord = async (req, res) => {
  try {
    res.status(201).json(await Dispensary.create({ ...req.body, studentId: req.user._id }));
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await Dispensary.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (req.user.role === "student" && record.studentId?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });
    res.json(await Dispensary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
  } catch (err) { res.status(400).json({ message: err.message }); }
};
