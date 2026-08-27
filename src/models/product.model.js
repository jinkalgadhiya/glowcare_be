const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
  },
  {
    _id: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    // ===============================
    // Basic Information
    // ===============================

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    badge: {
      type: String,
      enum: [
        "None",
        "New Launch",
        "Best Seller",
        "Trending",
        "Limited Stock",
        "Out of Stock",
        "Sold Out",
      ],
      default: "None",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ===============================
    // Product Variants
    // ===============================

    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: function (variants) {
          return variants && variants.length > 0;
        },
        message: "At least one product variant is required",
      },
    },

    // ===============================
    // Product Information
    // ===============================

    description: {
      type: String,
      default: "",
      trim: true,
    },

    keyIngredients: {
      type: String,
      default: "",
      trim: true,
    },

    howToUse: {
      type: String,
      default: "",
      trim: true,
    },

    caution: {
      type: String,
      default: "",
      trim: true,
    },

    // ===============================
    // Skincare Details
    // ===============================

    texture: {
      type: String,
      default: "",
      trim: true,
    },

    fragrance: {
      type: String,
      default: "",
      trim: true,
    },

    phValue: {
      type: String,
      default: "",
      trim: true,
    },

    shelfLife: {
      type: String,
      default: "",
      trim: true,
    },

    suitableFor: {
      type: [String],
      default: [],
    },

    skinConcerns: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    // ===============================
    // Images
    // ===============================

    image: {
      type: String,
      default: "",
      trim: true,
    },

    galleryImages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);