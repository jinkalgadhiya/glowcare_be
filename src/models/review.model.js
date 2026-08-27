const mongoose = require("mongoose");

// ======================================================
// REVIEW SCHEMA
// ======================================================

const reviewSchema = new mongoose.Schema(
  {
    // ==================================================
    // CUSTOMER
    // ==================================================

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
  type: String,
  default: "",
  trim: true,
  lowercase: true,
},

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    customerImage: {
      type: String,
      default: "",
    },

    // ==================================================
    // ORDER
    // ==================================================

    orderId: {
      type: String,
      required: true,
      trim: true,
    },

    orderNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // PRODUCT
    // ==================================================

    productId: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },

    // ==================================================
    // REVIEW
    // ==================================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true,
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Published",
        "Hidden",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "Review",
  reviewSchema
);