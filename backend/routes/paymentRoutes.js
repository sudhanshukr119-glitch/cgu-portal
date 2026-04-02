const router = require("express").Router();
const { auth } = require("../middleware/authMiddleware");
const { createOrder, verifyPayment } = require("../controllers/paymentController");

router.post("/order/:feeId", auth, createOrder);
router.post("/verify",       auth, verifyPayment);

module.exports = router;
