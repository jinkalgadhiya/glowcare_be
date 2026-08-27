const Review = require("../models/review.model");

// ======================================================
// CREATE REVIEW
// CUSTOMER
// POST /api/reviews
// ======================================================

const createReview = async (req, res) => {
  try {
    // ==================================================
    // AUTHENTICATED USER
    // ==================================================

    const customerId = req.user.id;

    // ==================================================
    // REQUEST DATA
    // ==================================================

    const {
      orderId,
      orderNumber,

      productId,
      productName,
      productImage,
      productSize,

      customerName,
      customerEmail,
      customerPhone,
      customerImage,

      rating,
      comment,
      review,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    if (!productName) {
      return res.status(400).json({
        status: "error",
        message: "Product name is required",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        status: "error",
        message: "Customer name is required",
      });
    }

    // ==================================================
    // CUSTOMER EMAIL IS OPTIONAL
    // ==================================================

    const normalizedCustomerEmail = customerEmail?.trim()
      ? customerEmail.trim().toLowerCase()
      : "";

    // ==================================================
    // RATING
    // ==================================================

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        status: "error",
        message: "Rating is required",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        status: "error",
        message: "Rating must be between 1 and 5",
      });
    }

    // ==================================================
    // REVIEW TEXT
    // ==================================================

    const reviewText = comment?.trim() || review?.trim();

    if (!reviewText) {
      return res.status(400).json({
        status: "error",
        message: "Review is required",
      });
    }

    if (reviewText.length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Review must contain at least 10 characters",
      });
    }

    if (reviewText.length > 500) {
      return res.status(400).json({
        status: "error",
        message: "Review cannot exceed 500 characters",
      });
    }

    // ==================================================
    // CHECK DUPLICATE REVIEW
    // ==================================================

    const existingReview = await Review.findOne({
      customerId,
      orderId,
      productId,
    });

    if (existingReview) {
      return res.status(409).json({
        status: "error",
        message: "You have already reviewed this product for this order",
      });
    }

    // ==================================================
    // CREATE REVIEW
    // ==================================================

    const newReview = await Review.create({
      // ==============================
      // CUSTOMER
      // ==============================

      customerId,

      customerName,

      customerEmail: normalizedCustomerEmail,

      customerPhone: customerPhone || "",

      customerImage: customerImage || "",

      // ==============================
      // ORDER
      // ==============================

      orderId,

      orderNumber: orderNumber || "",

      // ==============================
      // PRODUCT
      // ==============================

      productId,

      productName,

      productImage: productImage || "",

      productSize: productSize || "",

      // ==============================
      // REVIEW
      // ==============================

      rating: Number(rating),

      review: reviewText,

      // ==============================
      // STATUS
      // ==============================

      status: "Pending",
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      status: "success",
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// ======================================================
// GET CUSTOMER REVIEWS
// CUSTOMER
// GET /api/reviews/my
// ======================================================

const getMyReviews = async (req, res) => {
  try {
    const customerId = req.user.id;

    const reviews = await Review.find({
      customerId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      status: "success",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET MY REVIEWS ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL REVIEWS
// ADMIN
// GET /api/reviews
// ======================================================

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      status: "success",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET ALL REVIEWS ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE REVIEW
// ADMIN
// GET /api/reviews/:id
// ======================================================

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    return res.status(200).json({
      status: "success",
      review,
    });
  } catch (error) {
    console.error("GET REVIEW ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch review",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE REVIEW
// ADMIN
// DELETE /api/reviews/:id
// ======================================================

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE REVIEW STATUS
// ADMIN
// PATCH /api/reviews/:id/status
// ======================================================

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ==================================================
    // VALID STATUS
    // ==================================================

    const allowedStatuses = ["Pending", "Published", "Hidden"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid review status",
      });
    }

    // ==================================================
    // UPDATE
    // ==================================================

    const review = await Review.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Review status updated successfully",
      review,
    });
  } catch (error) {
    console.error("UPDATE REVIEW STATUS ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update review status",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createReview,
  getMyReviews,
  getAllReviews,
  getReviewById,
  deleteReview,
  updateReviewStatus,
};
