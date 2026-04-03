const rateLimit   = require("express-rate-limit");
const { detectBlockedPattern } = require("../ai/ruleEngine");
const AiQueryLog  = require("../models/AiQueryLog");

// ── Per-user AI rate limiter: 30 requests / 10 minutes ──────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { message: "Too many AI requests. Please wait a few minutes before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Input validation & blocked-pattern guard ─────────────────────────────────
const validateAiInput = async (req, res, next) => {
  const { question, context = "general" } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ message: "Question is required." });
  }

  if (question.trim().length > 1000) {
    return res.status(400).json({ message: "Question is too long. Please keep it under 1000 characters." });
  }

  const matched = detectBlockedPattern(question);
  if (matched) {
    // Log the unsafe query (non-blocking)
    AiQueryLog.create({
      userId:     req.user?._id,
      userRole:   req.user?.role,
      context,
      query:      question,
      flagReason: `Blocked pattern matched: "${matched}"`,
      blocked:    true,
      ipAddress:  req.ip,
    }).catch(() => {});

    return res.status(400).json({
      message: "Your query contains content that is not allowed on this platform. Please rephrase or contact support.",
    });
  }

  // Attach sanitised question back to body
  req.body.question = question.trim();
  next();
};

// ── Log all AI queries (non-blocking, for audit) ─────────────────────────────
const logAiQuery = (req, _res, next) => {
  const { question, context = "general" } = req.body;
  AiQueryLog.create({
    userId:    req.user?._id,
    userRole:  req.user?.role,
    context,
    query:     question,
    blocked:   false,
    ipAddress: req.ip,
  }).catch(() => {});
  next();
};

module.exports = { aiRateLimiter, validateAiInput, logAiQuery };
