const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getSubmissions, createSubmission, gradeSubmission } = require("../controllers/submissionController");

router.get("/", auth, requireRole("teacher", "student"), getSubmissions);
router.post("/", auth, requireRole("student"), createSubmission);
router.put("/:id", auth, requireRole("teacher"), gradeSubmission);

module.exports = router;
