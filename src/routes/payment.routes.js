const express = require("express");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/payment.controller");

const { checkAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", checkAuth, createRazorpayOrder);
router.post("/verify", checkAuth, verifyRazorpayPayment);

module.exports = router;