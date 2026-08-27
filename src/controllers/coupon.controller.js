const Coupon = require("../models/coupon.model");

// ======================================================
// CREATE COUPON
// ======================================================

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maximumDiscount,
      minimumOrderAmount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (
      !code ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        status: "error",
        message: "Required coupon fields are missing",
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Discount value must be greater than 0",
      });
    }

    if (
      discountType === "percentage" &&
      discountValue > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (new Date(expiryDate) <= new Date(startDate)) {
      return res.status(400).json({
        status: "error",
        message: "Expiry date must be after start date",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCoupon) {
      return res.status(409).json({
        status: "error",
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      maximumDiscount:
        maximumDiscount === "" ||
        maximumDiscount === undefined
          ? null
          : maximumDiscount,
      minimumOrderAmount: minimumOrderAmount || 0,
      startDate,
      expiryDate,
      usageLimit:
        usageLimit === "" ||
        usageLimit === undefined
          ? null
          : usageLimit,
      isActive:
        isActive === undefined ? true : isActive,
    });

    return res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create coupon",
    });
  }
};

// ======================================================
// GET ALL COUPONS
// ======================================================

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      status: "success",
      data: coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch coupons",
    });
  }
};

// ======================================================
// GET SINGLE COUPON
// ======================================================

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch coupon",
    });
  }
};

// ======================================================
// UPDATE COUPON
// ======================================================

const updateCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maximumDiscount,
      minimumOrderAmount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (
      startDate &&
      expiryDate &&
      new Date(expiryDate) <= new Date(startDate)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Expiry date must be after start date",
      });
    }

    if (code) {
      const duplicate = await Coupon.findOne({
        code: code.toUpperCase().trim(),
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return res.status(409).json({
          status: "error",
          message: "Coupon code already exists",
        });
      }

      coupon.code = code.toUpperCase().trim();
    }

    coupon.description = description ?? coupon.description;
    coupon.discountType =
      discountType ?? coupon.discountType;

    coupon.discountValue =
      discountValue ?? coupon.discountValue;

    coupon.maximumDiscount =
      maximumDiscount === ""
        ? null
        : maximumDiscount ?? coupon.maximumDiscount;

    coupon.minimumOrderAmount =
      minimumOrderAmount ?? coupon.minimumOrderAmount;

    coupon.startDate = startDate ?? coupon.startDate;
    coupon.expiryDate = expiryDate ?? coupon.expiryDate;

    coupon.usageLimit =
      usageLimit === ""
        ? null
        : usageLimit ?? coupon.usageLimit;

    coupon.isActive =
      isActive === undefined
        ? coupon.isActive
        : isActive;

    await coupon.save();

    return res.status(200).json({
      status: "success",
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update coupon",
    });
  }
};

// ======================================================
// DELETE COUPON
// ======================================================

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(
      req.params.id,
    );

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete coupon",
    });
  }
};

// ======================================================
// APPLY COUPON - CUSTOMER
// ======================================================

const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        status: "error",
        message: "Coupon code is required",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (
      Number.isNaN(orderSubtotal) ||
      orderSubtotal < 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid subtotal",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        status: "error",
        message: "This coupon is inactive",
      });
    }

    const now = new Date();

    if (now < coupon.startDate) {
      return res.status(400).json({
        status: "error",
        message: "This coupon is not active yet",
      });
    }

    if (now > coupon.expiryDate) {
      return res.status(400).json({
        status: "error",
        message: "This coupon has expired",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        status: "error",
        message: "This coupon usage limit has been reached",
      });
    }

    if (
      orderSubtotal < coupon.minimumOrderAmount
    ) {
      return res.status(400).json({
        status: "error",
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (orderSubtotal * coupon.discountValue) / 100;

      if (
        coupon.maximumDiscount !== null &&
        discount > coupon.maximumDiscount
      ) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Never allow discount above subtotal
    discount = Math.min(discount, orderSubtotal);

    const finalDiscount = Math.round(discount);

    return res.status(200).json({
      status: "success",
      message: "Coupon applied successfully",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discount: finalDiscount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to apply coupon",
    });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};