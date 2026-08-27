const express = require("express");

const {
  createReview,
  getMyReviews,
  getAllReviews,
  getReviewById,
  deleteReview,
  updateReviewStatus,
} = require("../controllers/review.controller");

const {
  checkAuth,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

// ======================================================
// CUSTOMER ROUTES
// ======================================================

// Submit review
router.post(
  "/",
  checkAuth,
  createReview
);

// Get logged-in customer's reviews
router.get(
  "/my",
  checkAuth,
  getMyReviews
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Get all reviews
router.get(
  "/",
  checkAuth,
  adminOnly,
  getAllReviews
);

// Get single review
router.get(
  "/:id",
  checkAuth,
  adminOnly,
  getReviewById
);

// Delete review
router.delete(
  "/:id",
  checkAuth,
  adminOnly,
  deleteReview
);

// Update review status
router.patch(
  "/:id/status",
  checkAuth,
  adminOnly,
  updateReviewStatus
);

module.exports = router;