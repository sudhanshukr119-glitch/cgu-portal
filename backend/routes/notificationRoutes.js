const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getNotifications, createNotification } = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.post("/", auth, requireRole("admin", "teacher"), createNotification);

module.exports = router;
