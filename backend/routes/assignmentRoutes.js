const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getAssignments, createAssignment } = require("../controllers/assignmentController");

router.get("/", auth, getAssignments);
router.post("/", auth, requireRole("teacher"), createAssignment);

module.exports = router;
