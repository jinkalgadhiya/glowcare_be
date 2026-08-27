const express = require("express");

const router = express.Router();

const {
  adminLogin,
  getCurrentAdmin,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/admin.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");

// Admin Login
router.post("/login", adminLogin);

// Current Admin
router.get("/me", checkAuth, getCurrentAdmin);

// Update Admin Profile
router.put("/profile", checkAuth, updateAdminProfile);

// Change Admin Password
router.put("/change-password", checkAuth, changeAdminPassword);

module.exports = router;