const Wishlist = require("../models/wishlist.model.js");
const Products = require("../models/product.model.js");

// ======================================================
// GET MY WISHLIST
// ======================================================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const wishlist = await Wishlist.findOne({
      userId,
    }).populate("products.productId");

    // No wishlist yet
    if (!wishlist) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    // Convert wishlist products into the format
    // expected by the frontend ProductCard
    const products = wishlist.products
      .filter((item) => item.productId)
      .map((item) => {
        const product = item.productId.toObject();

        return {
          ...product,

          // Frontend-compatible ID
          id: product._id,

          // Frontend-compatible name
          name: product.productName,

          // Wishlist-specific information
          wishlistVariantId: item.variantId,
          addedAt: item.addedAt,
        };
      });

    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    console.error(
      "Error fetching wishlist:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch wishlist",
    });
  }
};

// ======================================================
// ADD TO WISHLIST
// ======================================================

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { productId, variantId = null } = req.body;

    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // --------------------------------------------------
    // PRODUCT ID CHECK
    // --------------------------------------------------

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCT ID
    // --------------------------------------------------

    if (!Products.db.base.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCT EXISTS
    // --------------------------------------------------

    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // FIND USER WISHLIST
    // --------------------------------------------------

    let wishlist = await Wishlist.findOne({
      userId,
    });

    // --------------------------------------------------
    // CREATE WISHLIST IF NOT EXISTS
    // --------------------------------------------------

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [],
      });
    }

    // --------------------------------------------------
    // CHECK DUPLICATE
    // --------------------------------------------------

    const alreadyExists = wishlist.products.some(
      (item) =>
        item.productId?.toString() ===
        productId.toString()
    );

    if (alreadyExists) {
      return res.status(409).json({
        status: "error",
        message: "Product already exists in wishlist",
      });
    }

    // --------------------------------------------------
    // ADD PRODUCT
    // --------------------------------------------------

    wishlist.products.push({
      productId,
      variantId: variantId || null,
      addedAt: new Date(),
    });

    await wishlist.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      status: "success",
      message: "Product added to wishlist",
      data: {
        productId,
        variantId: variantId || null,
      },
    });
  } catch (error) {
    console.error(
      "Error adding to wishlist:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to add product to wishlist",
    });
  }
};

// ======================================================
// REMOVE FROM WISHLIST
// ======================================================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { productId } = req.params;

    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // --------------------------------------------------
    // PRODUCT ID CHECK
    // --------------------------------------------------

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    // --------------------------------------------------
    // VALIDATE OBJECT ID
    // --------------------------------------------------

    if (!Products.db.base.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    // --------------------------------------------------
    // FIND WISHLIST
    // --------------------------------------------------

    const wishlist = await Wishlist.findOne({
      userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        status: "error",
        message: "Wishlist not found",
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCT
    // --------------------------------------------------

    const originalLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (item) =>
        item.productId?.toString() !==
        productId.toString()
    );

    // --------------------------------------------------
    // PRODUCT NOT FOUND
    // --------------------------------------------------

    if (wishlist.products.length === originalLength) {
      return res.status(404).json({
        status: "error",
        message: "Product not found in wishlist",
      });
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    await wishlist.save();

    return res.status(200).json({
      status: "success",
      message: "Product removed from wishlist",
      data: {
        productId,
      },
    });
  } catch (error) {
    console.error(
      "Error removing from wishlist:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to remove product from wishlist",
    });
  }
};

// ======================================================
// CHECK WISHLIST
// ======================================================

const checkWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { productId } = req.params;

    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // --------------------------------------------------
    // PRODUCT ID CHECK
    // --------------------------------------------------

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    // --------------------------------------------------
    // VALIDATE OBJECT ID
    // --------------------------------------------------

    if (!Products.db.base.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    // --------------------------------------------------
    // FIND WISHLIST
    // --------------------------------------------------

    const wishlist = await Wishlist.findOne({
      userId,
    });

    if (!wishlist) {
      return res.status(200).json({
        status: "success",
        isWishlisted: false,
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCT
    // --------------------------------------------------

    const isWishlisted = wishlist.products.some(
      (item) =>
        item.productId?.toString() ===
        productId.toString()
    );

    return res.status(200).json({
      status: "success",
      isWishlisted,
    });
  } catch (error) {
    console.error(
      "Error checking wishlist:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to check wishlist",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};