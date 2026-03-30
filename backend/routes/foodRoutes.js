const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getOrders, placeOrder, updateOrder } = require("../controllers/foodController");

router.get("/", auth, getOrders);
router.post("/", auth, requireRole("student"), placeOrder);
router.put("/:id", auth, requireRole("admin"), updateOrder);

module.exports = router;
