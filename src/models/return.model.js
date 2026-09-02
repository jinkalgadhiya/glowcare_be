const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    // ==========================================
    // ORDER INFORMATION
    // ==========================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    orderNumber: {
      type: String,
      required: true,
    },

    // ==========================================
    // PRODUCT INFORMATION
    // ==========================================

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productImage: {
      type: String,
      default: "",
    },

    productSize: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
    },

    // ==========================================
    // CUSTOMER INFORMATION
    // ==========================================

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // RETURN INFORMATION
    // ==========================================

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // PRICE INFORMATION
    // ==========================================

    productPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // Actual amount customer paid for this product
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Amount requested for refund
    refundAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    // ==========================================
    // RETURN STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Pickup Scheduled",
        "Picked Up",
        "Received",
        "Refunded",
        "Cancelled",
      ],

      default: "Pending",
    },

    // ==========================================
    // ADMIN INFORMATION
    // ==========================================

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    refundStatus: {
      type: String,

      enum: [
        "Not Initiated",
        "Pending",
        "Processed",
        "Completed",
      ],

      default: "Not Initiated",
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// PREVENT DUPLICATE RETURN REQUESTS
// FOR SAME PRODUCT IN SAME ORDER
// ==========================================

returnSchema.index(
  {
    orderId: 1,
    productId: 1,
  },
  {
    unique: true,
  },
);

// ==========================================
// MODEL
// ==========================================

const ReturnRequest = mongoose.model(
  "ReturnRequest",
  returnSchema,
);

// ==========================================
// EXPORT
// ==========================================

module.exports = ReturnRequest;