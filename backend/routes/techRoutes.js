const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getTickets, createTicket, updateTicket } = require("../controllers/techController");

router.get("/", auth, getTickets);
router.post("/", auth, requireRole("student", "teacher"), createTicket);
router.put("/:id", auth, requireRole("admin"), updateTicket);

module.exports = router;
