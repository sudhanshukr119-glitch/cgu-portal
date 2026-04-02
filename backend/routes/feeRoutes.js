const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getFees, getFeeSummary, createFee, updateFee } = require("../controllers/feeController");

router.get("/",        auth, getFees);
router.get("/summary", auth, getFeeSummary);
router.post("/",       auth, requireRole("admin"), createFee);
router.put("/:id",     auth, updateFee);

module.exports = router;
