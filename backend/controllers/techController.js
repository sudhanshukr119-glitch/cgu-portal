const TechSupport = require("../models/TechSupport");

exports.getTickets = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    res.json(await TechSupport.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTicket = async (req, res) => {
  try {
    res.json(await TechSupport.create({ ...req.body, userId: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTicket = async (req, res) => {
  try {
    if (req.body.status === "resolved") req.body.resolvedAt = new Date();
    res.json(await TechSupport.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
