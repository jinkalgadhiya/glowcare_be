const crypto = require("crypto");
const Razorpay = require("razorpay");
const Orders = require("../models/order.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE RAZORPAY ORDER =================

const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "MongoDB order ID is required",
      });
    }

    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.userId) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this order",
      });
    }

    if (order.paymentMethod !== "Online") {
      return res.status(400).json({
        success: false,
        message: "This order is not an online payment order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order is already paid",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.pricing.total * 100),
      currency: "INR",
      receipt: order.orderNumber,
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = "Pending";

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

// ================= VERIFY RAZORPAY PAYMENT =================

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are incomplete",
      });
    }

    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.userId) !== String(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this order",
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!isSignatureValid) {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    order.paymentMethod = "Online";
    order.paymentStatus = "Paid";
    order.status = "Processing";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};