const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Fee      = require("../models/Fee");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// Create a Razorpay order for a fee record
exports.createOrder = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.feeId);
    if (!fee) return res.status(404).json({ message: "Fee not found" });
    if (fee.status === "paid") return res.status(400).json({ message: "Fee already paid" });

    const order = await razorpay.orders.create({
      amount:   fee.amount * 100, // paise
      currency: "INR",
      receipt:  `fee_${fee._id}`,
      notes:    { feeId: fee._id.toString(), studentId: req.user.id },
    });

    res.json({ orderId: order.id, amount: fee.amount, currency: "INR", key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Verify Razorpay payment signature and mark fee as paid
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId } = req.body;

    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed" });

    const fee = await Fee.findByIdAndUpdate(
      feeId,
      { status: "paid", paidDate: new Date(), paymentId: razorpay_payment_id },
      { new: true }
    );
    res.json({ success: true, fee });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
