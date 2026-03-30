const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getRecords, createRecord, updateRecord } = require("../controllers/dispensaryController");

router.get("/", auth, getRecords);
router.post("/", auth, requireRole("student", "teacher"), createRecord);
router.put("/:id", auth, requireRole("admin"), updateRecord);

module.exports = router;
