const Cart = require("../models/cart.model.js");

// ======================================================
// GET MY CART
// ======================================================

const getMyCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const cart = await Cart.findOne({ userId });

    // If customer doesn't have a cart yet
    if (!cart) {
      return res.status(200).json({
        status: "success",
        data: {
          items: [],
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch cart",
    });
  }
};

// ======================================================
// ADD / UPDATE CART ITEM
// ======================================================

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const {
      productId,
      variantId,
      name,
      image,
      category,
      description,
      size,
      price,
      originalPrice,
      quantity,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!productId || !variantId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID and variant ID are required",
      });
    }

    if (!name || price === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Product name and price are required",
      });
    }

    const itemQuantity = Number(quantity) || 1;

    if (itemQuantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
      });
    }

    // ==================================================
    // FIND CUSTOMER CART
    // ==================================================

    let cart = await Cart.findOne({ userId });

    // ==================================================
    // CREATE CART IF IT DOESN'T EXIST
    // ==================================================

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            variantId,
            name,
            image: image || "",
            category: category || "",
            description: description || "",
            size: size || "",
            price: Number(price),
            originalPrice: Number(originalPrice) || 0,
            quantity: itemQuantity,
          },
        ],
      });

      await cart.save();

      return res.status(201).json({
        status: "success",
        message: "Product added to cart",
        data: cart,
      });
    }

    // ==================================================
    // CHECK IF ITEM ALREADY EXISTS
    // ==================================================

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.variantId.toString() === variantId.toString()
    );

    if (existingItem) {
      // Increase existing quantity
      existingItem.quantity += itemQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId,
        name,
        image: image || "",
        category: category || "",
        description: description || "",
        size: size || "",
        price: Number(price),
        originalPrice: Number(originalPrice) || 0,
        quantity: itemQuantity,
      });
    }

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to add product to cart",
    });
  }
};

// ======================================================
// UPDATE CART ITEM QUANTITY
// ======================================================

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.params;

    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const newQuantity = Number(quantity);

    if (!newQuantity || newQuantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found",
      });
    }

    item.quantity = newQuantity;

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart quantity updated",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update cart item",
    });
  }
};

// ======================================================
// REMOVE CART ITEM
// ======================================================

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.variantId.toString() === variantId
        )
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found",
      });
    }

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to remove cart item",
    });
  }
};

// ======================================================
// CLEAR CART
// ======================================================

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        status: "success",
        message: "Cart is already empty",
        data: {
          items: [],
        },
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to clear cart",
    });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};