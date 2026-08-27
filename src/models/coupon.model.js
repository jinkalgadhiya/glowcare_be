const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // ================================
    // COUPON CODE
    // ================================
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ================================
    // DISCOUNT
    // ================================
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Maximum discount for percentage coupons
    maximumDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    // ================================
    // ORDER CONDITION
    // ================================
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ================================
    // VALIDITY
    // ================================
    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    // ================================
    // USAGE
    // ================================
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ================================
    // STATUS
    // ================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;