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
    const post = await LostFound.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only owner or admin can update
    if (post.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised to update this post" });

    const updates = { ...req.body };
    if (updates.status === "resolved") {
      updates.type = "found";
      updates.resolvedAt = new Date();
    }
    res.json(await LostFound.findByIdAndUpdate(req.params.id, updates, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await LostFound.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only owner or admin can delete
    if (post.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised to delete this post" });

    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
