const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getEvents, createEvent, rsvpEvent, deleteEvent } = require("../controllers/eventController");

router.get("/", auth, getEvents);
router.post("/", auth, requireRole("admin", "teacher"), createEvent);
router.post("/:id/rsvp", auth, rsvpEvent);
router.delete("/:id", auth, requireRole("admin", "teacher"), deleteEvent);

module.exports = router;
