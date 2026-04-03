const TechSupport = require("../models/TechSupport");

exports.getTickets = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    res.json(await TechSupport.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTicket = async (req, res) => {
  try {
    const { category, description, priority, userName } = req.body;
    if (!category || !description) return res.status(400).json({ message: "Category and description are required" });
    const ticket = await TechSupport.create({ category, description, priority: priority || "medium", userName, userId: req.user._id });
    res.status(201).json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTicket = async (req, res) => {
  try {
    if (req.body.status === "resolved") req.body.resolvedAt = new Date();
    res.json(await TechSupport.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
