const crypto = require("crypto");
const Razorpay = require("razorpay");

const Orders = require("../models/order.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getLoggedInUserId = (req) => {
  return req.user?.userId || req.user?.id || req.user?._id;
};

const createRazorpayOrder = async (req, res) => {
  try {
    console.log("========== CREATE RAZORPAY ORDER ==========");
    console.log("REQUEST BODY:", req.body);
    console.log("AUTHENTICATED USER:", req.user);

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing",
      });
    }

    const order = await Orders.findOne({
      _id: orderId,
      userId: userId,
    });

    if (!order) {
      console.log("ORDER NOT FOUND FOR USER:", {
        orderId,
        userId,
      });

      return res.status(404).json({
        success: false,
        message: "Order not found for this user",
      });
    }

    console.log("MONGODB ORDER:", order);

    if (order.paymentMethod !== "Online") {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method: ${order.paymentMethod}`,
      });
    }

    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: "RAZORPAY_KEY_ID is missing on the server",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "RAZORPAY_KEY_SECRET is missing on the server",
      });
    }

    const amountInPaise = Math.round(Number(order.pricing.total) * 100);

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: String(order.orderNumber).slice(0, 40),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    console.log("RAZORPAY ORDER CREATED:", razorpayOrder.id);

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing",
      });
    }

    const order = await Orders.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "Paid";
    order.status = "Processing";
    order.paidAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (error) {
    console.error("VERIFY RAZORPAY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};