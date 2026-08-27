const express = require("express");

const route = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/order.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");
const { adminOnly } = require("../middleware/adminMiddleware.js");

// ======================================================
// CUSTOMER ROUTES
// ======================================================

// Place a new order
route.post("/", checkAuth, createOrder);

// Get orders of currently logged-in customer
route.get("/my-orders", checkAuth, getMyOrders);

// ======================================================
// ADMIN ORDER MANAGEMENT
// ======================================================

// Get all orders
route.get("/", checkAuth, adminOnly, getAllOrders);

// Get single order
route.get("/:id", checkAuth, adminOnly, getSingleOrder);

// Update order/payment status
route.put("/:id/status", checkAuth, adminOnly, updateOrderStatus);

// Delete order
route.delete("/:id", checkAuth, adminOnly, deleteOrder);

module.exports = route;