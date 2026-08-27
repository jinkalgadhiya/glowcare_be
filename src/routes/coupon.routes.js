const express = require("express");

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../controllers/coupon.controller");

const router = express.Router();

// CUSTOMER
router.post("/apply", applyCoupon);

// ADMIN
router.get("/", getCoupons);
router.post("/", createCoupon);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;