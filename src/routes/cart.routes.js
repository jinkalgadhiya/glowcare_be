const express = require("express");

const router = express.Router();

const {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");

// ======================================================
// CUSTOMER CART ROUTES
// ======================================================

// Get logged-in customer's cart
router.get("/", checkAuth, getMyCart);

// Add product / increase existing product quantity
router.post("/", checkAuth, addToCart);

// Update exact quantity
router.put(
  "/:productId/:variantId",
  checkAuth,
  updateCartItem
);

// Remove product
router.delete(
  "/:productId/:variantId",
  checkAuth,
  removeFromCart
);

// Clear entire cart
router.delete("/", checkAuth, clearCart);

module.exports = router;