const LostFound = require("../models/LostFound");

exports.getPosts = async (req, res) => {
  try {
    res.json(await LostFound.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createPost = async (req, res) => {
  try {
    res.json(await LostFound.create({ ...req.body, userId: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updatePost = async (req, res) => {
  try {
    const updates = { ...req.body };
    // When resolving a lost item → automatically mark type as "found"
    if (updates.status === "resolved") {
      updates.type = "found";
      updates.resolvedAt = new Date();
    }
    res.json(await LostFound.findByIdAndUpdate(req.params.id, updates, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
