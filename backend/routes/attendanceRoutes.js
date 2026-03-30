const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getAttendance, markAttendance, bulkMark } = require("../controllers/attendanceController");
const { getSelf, upsertSelf } = require("../controllers/selfAttendanceController");

router.get("/", auth, getAttendance);
router.post("/", auth, requireRole("teacher", "admin"), markAttendance);
router.post("/bulk", auth, requireRole("teacher", "admin"), bulkMark);

// Student self-tracking (isolated, never affects teacher records)
router.get("/self", auth, requireRole("student"), getSelf);
router.post("/self", auth, requireRole("student"), upsertSelf);

module.exports = router;
