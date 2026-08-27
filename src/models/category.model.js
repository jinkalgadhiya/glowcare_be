const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Menu where the category belongs
    menuType: {
      type: String,
      enum: ["skincare", "haircare", "more"],
      required: true,
      trim: true,
    },

    // Main category or sub category
    categoryType: {
      type: String,
      enum: ["main", "sub"],
      required: true,
      trim: true,
    },

    // Main category name
    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },

    // Sub category name
    subCategory: {
      type: String,
      default: "",
      trim: true,
    },

    // Category description
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Category banner image
    bannerImage: {
      type: String,
      default: "",
      trim: true,
    },

    // Category status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;