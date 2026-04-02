const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { saveSession, getLeaderboard, getMySession } = require("../controllers/studyController");

router.post("/",           auth, requireRole("student"), saveSession);
router.get("/leaderboard", auth, getLeaderboard);
router.get("/me",          auth, requireRole("student"), getMySession);

module.exports = router;
