const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();
const cors = require("cors");
const crypto = require("crypto");

const router = express.Router();
const PORT = process.env.PAYMENT_PORT || 9000;
const app = express();

app.use(express.json());
app.use(cors());

router.post("/orders", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
});

router.post("/success", async (req, res) => {
  try {
    const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

    res.json({ msg: "success", orderId: razorpayOrderId, paymentId: razorpayPaymentId });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify Razorpay payment",
      error: error.message,
    });
  }
});

app.use("/payment", router);

app.listen(PORT, () => {
  console.log(`Payment server is running on http://127.0.0.1:${PORT}`);
});
