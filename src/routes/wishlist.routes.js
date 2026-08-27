const express = require("express");

const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("../controllers/wishlist.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");

// ======================================================
// CUSTOMER WISHLIST
// ======================================================

// Get logged-in customer's wishlist
router.get("/", checkAuth, getWishlist);

// Add product to wishlist
router.post("/", checkAuth, addToWishlist);

// Check whether product is wishlisted
router.get("/check/:productId", checkAuth, checkWishlist);

// Remove product from wishlist
router.delete("/:productId", checkAuth, removeFromWishlist);

module.exports = router;