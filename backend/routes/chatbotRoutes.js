const express = require("express");
const multer  = require("multer");
const { uploadPDF, ask, getSources, deleteSource } = require("../controllers/chatbotController");
const { auth, requireRole } = require("../middleware/authMiddleware");
const { aiRateLimiter, validateAiInput, logAiQuery } = require("../middleware/aiMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/upload",            auth, requireRole("admin"), upload.single("pdf"), uploadPDF);
router.get("/sources",            auth, requireRole("admin"), getSources);
router.delete("/sources/:source", auth, requireRole("admin"), deleteSource);

// ask: rate limit → input guard → audit log → handler
router.post("/ask", auth, aiRateLimiter, validateAiInput, logAiQuery, ask);

module.exports = router;
