const router = require("express").Router();
const { auth, requireRole, logActivity } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/leaveController");

router.get("/",          auth, ctrl.getLeaves);
router.post("/",         auth, requireRole("student"), logActivity("APPLY_LEAVE","leaves"), ctrl.applyLeave);
router.put("/:id/review",auth, requireRole("teacher","admin"), logActivity("REVIEW_LEAVE","leaves"), ctrl.reviewLeave);

module.exports = router;
