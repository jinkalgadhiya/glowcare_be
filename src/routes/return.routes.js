const express = require("express");

const {
  createReturnRequest,
  getAllReturnRequests,
  getReturnRequestById,
  updateReturnStatus,
} = require("../controllers/return.controller");

const router = express.Router();

// =====================================================
// CUSTOMER
// =====================================================

// CREATE RETURN REQUEST

router.post(
  "/",
  createReturnRequest,
);

// =====================================================
// ADMIN
// =====================================================

// GET ALL RETURN REQUESTS

router.get(
  "/",
  getAllReturnRequests,
);

// GET SINGLE RETURN REQUEST

router.get(
  "/:id",
  getReturnRequestById,
);

// UPDATE RETURN STATUS

router.patch(
  "/:id/status",
  updateReturnStatus,
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;