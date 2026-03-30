const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getFees, createFee, updateFee } = require("../controllers/feeController");

router.get("/", auth, getFees);
router.post("/", auth, requireRole("admin"), createFee);
router.put("/:id", auth, requireRole("admin"), updateFee);

module.exports = router;
