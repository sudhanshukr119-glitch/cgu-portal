const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getRequests, createRequest, updateRequest } = require("../controllers/libraryController");

router.get("/", auth, getRequests);
router.post("/", auth, requireRole("student", "teacher"), createRequest);
router.put("/:id", auth, requireRole("admin"), updateRequest);

module.exports = router;
