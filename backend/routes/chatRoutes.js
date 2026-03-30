const router = require("express").Router();
const { getMessages, sendMessage, getConversations } = require("../controllers/chatController");
const { auth, requireRole } = require("../middleware/authMiddleware");

router.get("/conversations", auth, requireRole("student", "teacher"), getConversations);
router.get("/:userId", auth, requireRole("student", "teacher"), getMessages);
router.post("/", auth, requireRole("student", "teacher"), sendMessage);

module.exports = router;
