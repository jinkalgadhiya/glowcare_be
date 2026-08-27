const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    // ==========================================
    // OWNER OF ADDRESS
    // ==========================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    // ==========================================
    // ADDRESS TYPE
    // ==========================================

    addressType: {
      type: String,
      enum: ["Home", "Work"],
      default: "Home",
    },

    // ==========================================
    // ADDRESS DETAILS
    // ==========================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // DEFAULT ADDRESS
    // ==========================================

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", addressSchema);