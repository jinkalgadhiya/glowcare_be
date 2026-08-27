const Address = require("../models/address.model.js");

// ======================================================
// GET MY ADDRESSES
// ======================================================

const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const addresses = await Address.find({
      userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch addresses",
    });
  }
};

// ======================================================
// ADD ADDRESS
// ======================================================

const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const {
      addressType,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (
      !fullName ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        status: "error",
        message: "All address details are required",
      });
    }

    // ------------------------------------------
    // Check whether user already has addresses
    // ------------------------------------------

    const existingAddresses = await Address.find({
      userId,
    });

    // First address automatically becomes default
    const shouldBeDefault =
      existingAddresses.length === 0 || isDefault === true;

    // ------------------------------------------
    // If this address is default,
    // remove default from previous addresses
    // ------------------------------------------

    if (shouldBeDefault) {
      await Address.updateMany(
        {
          userId,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // ------------------------------------------
    // Create address
    // ------------------------------------------

    const newAddress = await Address.create({
      userId,
      addressType: addressType || "Home",
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      status: "success",
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error adding address:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to add address",
    });
  }
};

// ======================================================
// UPDATE ADDRESS
// ======================================================

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!addressId) {
      return res.status(400).json({
        status: "error",
        message: "Address ID is required",
      });
    }

    const {
      addressType,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    // ------------------------------------------
    // Make sure address belongs to logged-in user
    // ------------------------------------------

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found",
      });
    }

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (
      !fullName ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        status: "error",
        message: "All address details are required",
      });
    }

    // ------------------------------------------
    // If making this address default
    // ------------------------------------------

    if (isDefault === true) {
      await Address.updateMany(
        {
          userId,
          _id: {
            $ne: addressId,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // ------------------------------------------
    // Update address
    // ------------------------------------------

    address.addressType = addressType || "Home";
    address.fullName = fullName.trim();
    address.phone = phone.trim();
    address.addressLine = addressLine.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.pincode = pincode.trim();

    if (typeof isDefault === "boolean") {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error updating address:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update address",
    });
  }
};

// ======================================================
// SET DEFAULT ADDRESS
// ======================================================

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found",
      });
    }

    // Remove default from all user's addresses
    await Address.updateMany(
      {
        userId,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    // Make selected address default
    address.isDefault = true;

    await address.save();

    res.status(200).json({
      status: "success",
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Error setting default address:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to set default address",
    });
  }
};

// ======================================================
// DELETE ADDRESS
// ======================================================

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: addressId,
      userId,
    });

    // ------------------------------------------
    // If default address was deleted,
    // make another address default
    // ------------------------------------------

    if (wasDefault) {
      const nextAddress = await Address.findOne({
        userId,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      status: "success",
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to delete address",
    });
  }
};

module.exports = {
  getMyAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};