const Marketplace = require("../models/Marketplace");
const MarketplaceMessage = require("../models/MarketplaceMessage");

exports.getListings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All")
      filter.category = req.query.category;
    const listings = await Marketplace.find(filter).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createListing = async (req, res) => {
  try {
    const { title, price, category, desc, image } = req.body;
    if (!title?.trim() || !price || !desc?.trim())
      return res.status(400).json({ message: "Title, price and description are required." });
    const listing = await Marketplace.create({
      title, price: Number(price), category, desc, image,
      seller:   req.user.name,
      sellerId: req.user._id,
      dept:     req.user.class || req.user.department || "",
    });
    res.status(201).json(listing);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Marketplace.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised." });
    const updated = await Marketplace.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Marketplace.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised." });
    await listing.deleteOne();
    res.json({ message: "Deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await MarketplaceMessage.find({ listingId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty." });
    const msg = await MarketplaceMessage.create({
      listingId:  req.params.id,
      senderId:   req.user._id,
      senderName: req.user.name,
      text: text.trim(),
    });
    req.io?.to(`mp_${req.params.id}`).emit("mp_message", msg);
    res.status(201).json(msg);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
