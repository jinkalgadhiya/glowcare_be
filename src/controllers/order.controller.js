const Orders = require("../models/order.model.js");
const Users = require("../models/user.model.js");

// ======================================================
// CREATE ORDER
// ======================================================

const createOrder = async (req, res) => {
  try {
    // Get logged-in user ID
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const {
      items,
      shippingAddress,
      pricing,
      paymentMethod,
      deliveryMethod,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Order must contain at least one product",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        status: "error",
        message: "Shipping address is required",
      });
    }

    if (!pricing) {
      return res.status(400).json({
        status: "error",
        message: "Order pricing is required",
      });
    }

    // ==================================================
    // GET LOGGED-IN USER
    // ==================================================

    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // ==================================================
    // PREPARE ORDER ITEMS
    // ==================================================

    const orderItems = items.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      return {
        productId: item.productId,
        variantId: item.variantId || "",
        name: item.name,
        image: item.image || "",
        category: item.category || "",
        size: item.size || "",
        price,
        quantity,
        total: price * quantity,
      };
    });

    // ==================================================
    // ORDER NUMBER
    // ==================================================

    const orderNumber = `GC-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // ==================================================
    // CUSTOMER
    // ==================================================

    const customer = {
      fullName: user.fullName,
      email: user.email,
      contactNumber:
        user.contactNumber ||
        shippingAddress.contactNumber ||
        "",
    };

    // ==================================================
    // PRICING
    // ==================================================

    const subtotal = Number(pricing.subtotal) || 0;
    const discount = Number(pricing.discount) || 0;
    const shipping = Number(pricing.shipping) || 0;
    const gst = Number(pricing.gst) || 0;
    const total = Number(pricing.total) || 0;

    // ==================================================
    // DELIVERY
    // ==================================================

    const validDeliveryMethods = ["Standard", "Express"];

    const finalDeliveryMethod = validDeliveryMethods.includes(
      deliveryMethod
    )
      ? deliveryMethod
      : "Standard";

    // ==================================================
    // PAYMENT
    // ==================================================

    const finalPaymentMethod =
      paymentMethod === "Online" ? "Online" : "COD";

    const paymentStatus = "Pending";

    // ==================================================
    // CREATE ORDER
    // ==================================================

    const newOrder = new Orders({
      userId,

      orderNumber,

      items: orderItems,

      customer,

      shippingAddress: {
        fullName:
          shippingAddress.fullName ||
          user.fullName,

        contactNumber:
          shippingAddress.contactNumber ||
          user.contactNumber ||
          "",

        address:
          shippingAddress.address || "",

        city:
          shippingAddress.city || "",

        state:
          shippingAddress.state || "",

        pincode:
          shippingAddress.pincode || "",
      },

      pricing: {
        subtotal,
        discount,
        shipping,
        gst,
        total,
      },

      deliveryMethod: finalDeliveryMethod,

      paymentMethod: finalPaymentMethod,

      paymentStatus,

      status: "Pending",

      orderDate: new Date(),
    });

    const savedOrder = await newOrder.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to create order",
    });
  }
};

// ======================================================
// GET MY ORDERS
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const orders = await Orders.find({
      userId,
    }).sort({
      orderDate: -1,
    });

    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};

// ======================================================
// GET ALL ORDERS - ADMIN
// ======================================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find()
      .populate(
        "userId",
        "fullName email contactNumber"
      )
      .sort({
        orderDate: -1,
      });

    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// ======================================================

const getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    const order = await Orders.findById(orderId).populate(
      "userId",
      "fullName email contactNumber"
    );

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch order",
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// ======================================================

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;

    const {
      status,
      paymentStatus,
    } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const allowedPaymentStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    // ==================================================
    // STATUS VALIDATION
    // ==================================================

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order status",
      });
    }

    if (
      paymentStatus &&
      !allowedPaymentStatuses.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment status",
      });
    }

    // ==================================================
    // UPDATE DATA
    // ==================================================

    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus =
        paymentStatus;
    }

    // ==================================================
    // UPDATE ORDER
    // ==================================================

    const updatedOrder =
      await Orders.findByIdAndUpdate(
        orderId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "userId",
        "fullName email contactNumber"
      );

    if (!updatedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Error updating order:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to update order",
    });
  }
};

// ======================================================
// DELETE ORDER - ADMIN
// ======================================================

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required",
      });
    }

    const deletedOrder =
      await Orders.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting order:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to delete order",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
};