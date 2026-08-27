const express = require("express");

const router = express.Router();

const {
  getMyAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/address.controller.js");

const { checkAuth } = require("../middleware/authMiddleware.js");

// ======================================================
// CUSTOMER ADDRESS ROUTES
// ======================================================

// Get logged-in customer's addresses
router.get("/", checkAuth, getMyAddresses);

// Add address
router.post("/", checkAuth, addAddress);

// Update address
router.put("/:id", checkAuth, updateAddress);

// Set default address
router.put("/:id/default", checkAuth, setDefaultAddress);

// Delete address
router.delete("/:id", checkAuth, deleteAddress);

module.exports = router;