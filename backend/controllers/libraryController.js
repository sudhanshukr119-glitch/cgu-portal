const Library = require("../models/Library");

exports.getRequests = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user._id } : {};
    res.json(await Library.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    res.status(201).json(await Library.create({
      ...req.body, studentId: req.user._id, issueDate: new Date(), dueDate: due,
    }));
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateRequest = async (req, res) => {
  try {
    const record = await Library.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (req.user.role === "student" && record.studentId?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });
    if (req.body.status === "returned") req.body.returnDate = new Date();
    res.json(await Library.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
  } catch (err) { res.status(400).json({ message: err.message }); }
};
