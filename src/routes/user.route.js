const express = require("express");

const route = express.Router();

const {
  addUser,
  updateUser,
  deleteUser,
  getAllUser,
  getSingleUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/user.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");
const { adminOnly } = require("../middleware/adminMiddleware.js");

// ======================================================
// REGISTER
// ======================================================

// Public registration
route.post("/add", addUser);

// ======================================================
// CURRENT LOGGED-IN USER
// ======================================================

// Get currently logged-in user's profile
route.get("/me", checkAuth, getCurrentUser);

// Update currently logged-in user's profile
route.put("/me", checkAuth, updateCurrentUser);

// ======================================================
// ADMIN / USER MANAGEMENT
// ======================================================

// Get all users
route.get(
  "/",
  checkAuth,
  adminOnly,
  getAllUser
);

// Get single user
route.get(
  "/get/:id",
  checkAuth,
  adminOnly,
  getSingleUser
);

// Update user
route.put(
  "/update/:id",
  checkAuth,
  adminOnly,
  updateUser
);

// Delete user
route.delete(
  "/delete/:id",
  checkAuth,
  adminOnly,
  deleteUser
);

module.exports = route;