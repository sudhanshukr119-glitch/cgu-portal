const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getRequests, createRequest, updateRequest } = require("../controllers/hostelController");

router.get("/", auth, getRequests);
router.post("/", auth, requireRole("student"), createRequest);
router.put("/:id", auth, updateRequest); // students: confirm only | admin: full control

module.exports = router;
