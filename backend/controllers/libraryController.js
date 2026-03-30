const Library = require("../models/Library");

exports.getRequests = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    res.json(await Library.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    res.json(await Library.create({ ...req.body, studentId: req.user.id, issueDate: new Date(), dueDate: due }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateRequest = async (req, res) => {
  try {
    if (req.body.status === "returned") req.body.returnDate = new Date();
    res.json(await Library.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
