const express     = require("express");
const AiQueryLog  = require("../models/AiQueryLog");
const { auth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/ai-logs?blocked=true&limit=50
router.get("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.blocked === "true") filter.blocked = true;

    const logs = await AiQueryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 100)
      .populate("userId", "name email role")
      .lean();

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
