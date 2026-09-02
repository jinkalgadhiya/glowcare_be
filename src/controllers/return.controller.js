const ReturnRequest = require("../models/return.model");

// =====================================================
// CREATE RETURN REQUEST
// POST /api/returns
// =====================================================

const createReturnRequest = async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,

      productId,
      productName,
      productImage,
      productSize,
      quantity,

      customerName,
      customerEmail,
      customerPhone,

      reason,
      details,

      productPrice,
      paidAmount,
      refundAmount,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required.",
      });
    }

    // =================================================
    // CHECK DUPLICATE RETURN REQUEST
    // =================================================

    const existingReturn = await ReturnRequest.findOne({
      orderId,
      productId,
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message:
          "A return request already exists for this product.",
      });
    }

    // =================================================
    // CREATE RETURN REQUEST
    // =================================================

    const returnRequest = await ReturnRequest.create({
      orderId,
      orderNumber,

      productId,
      productName,
      productImage,
      productSize,

      quantity: Number(quantity) || 1,

      customerName,
      customerEmail,
      customerPhone,

      reason,
      details,

      productPrice: Number(productPrice) || 0,

      paidAmount: Number(paidAmount) || 0,

      refundAmount: Number(refundAmount) || 0,

      status: "Pending",
    });

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Your return request has been submitted successfully.",

      data: returnRequest,
    });
  } catch (error) {
    console.error(
      "CREATE RETURN REQUEST ERROR:",
      error,
    );

    // ===============================================
    // DUPLICATE INDEX ERROR
    // ===============================================

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A return request already exists for this product.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to submit return request.",

      error: error.message,
    });
  }
};

// =====================================================
// GET ALL RETURN REQUESTS
// ADMIN
// GET /api/returns
// =====================================================

const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await ReturnRequest.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,

      data: returnRequests,
    });
  } catch (error) {
    console.error(
      "GET RETURN REQUESTS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch return requests.",

      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE RETURN REQUEST
// GET /api/returns/:id
// =====================================================

const getReturnRequestById = async (req, res) => {
  try {
    const returnRequest =
      await ReturnRequest.findById(
        req.params.id,
      );

    if (!returnRequest) {
      return res.status(404).json({
        success: false,

        message:
          "Return request not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data: returnRequest,
    });
  } catch (error) {
    console.error(
      "GET RETURN REQUEST ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch return request.",

      error: error.message,
    });
  }
};

// =====================================================
// UPDATE RETURN STATUS
// ADMIN
// PATCH /api/returns/:id/status
// =====================================================

const updateReturnStatus = async (req, res) => {
  try {
    const {
      status,
      adminNote,
      refundStatus,
    } = req.body;

    // =================================================
    // ALLOWED RETURN STATUSES
    // =================================================

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Pickup Scheduled",
      "Picked Up",
      "Received",
      "Refunded",
      "Cancelled",
    ];

    // =================================================
    // ALLOWED REFUND STATUSES
    // =================================================

    const allowedRefundStatuses = [
      "Not Initiated",
      "Pending",
      "Processed",
      "Completed",
    ];

    // =================================================
    // VALIDATE RETURN STATUS
    // =================================================

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,

        message: "Invalid return status.",
      });
    }

    // =================================================
    // VALIDATE REFUND STATUS
    // =================================================

    if (
      refundStatus &&
      !allowedRefundStatuses.includes(
        refundStatus,
      )
    ) {
      return res.status(400).json({
        success: false,

        message: "Invalid refund status.",
      });
    }

    // =================================================
    // BUILD UPDATE DATA
    // =================================================

    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    if (refundStatus) {
      updateData.refundStatus =
        refundStatus;
    }

    // =================================================
    // UPDATE RETURN REQUEST
    // =================================================

    const updatedReturn =
      await ReturnRequest.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

    // =================================================
    // NOT FOUND
    // =================================================

    if (!updatedReturn) {
      return res.status(404).json({
        success: false,

        message:
          "Return request not found.",
      });
    }

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Return request updated successfully.",

      data: updatedReturn,
    });
  } catch (error) {
    console.error(
      "UPDATE RETURN STATUS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update return request.",

      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createReturnRequest,
  getAllReturnRequests,
  getReturnRequestById,
  updateReturnStatus,
};