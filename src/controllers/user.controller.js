const Users = require("../models/user.model.js");
const Orders = require("../models/order.model.js");
const bcrypt = require("bcryptjs");

// ======================================================
// ADD USER / REGISTER
// ======================================================

const addUser = async (req, res) => {
  try {
    const { fullName, email, contactNumber, password, profileImage } = req.body;

    if (!fullName || !email || !contactNumber || !password) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email, contact number and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedContact = contactNumber.trim();

    const existingUser = await Users.findOne({
      $or: [{ email: normalizedEmail }, { contactNumber: normalizedContact }],
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email or contact number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      fullName: fullName.trim(),
      email: normalizedEmail,
      contactNumber: normalizedContact,
      password: hashedPassword,
      profileImage: profileImage || "",
      role: "user",
      status: "Active",
    });

    const savedUser = await newUser.save();

    const userResponse = savedUser.toObject();

    delete userResponse.password;

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error adding user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to register user",
    });
  }
};

// ======================================================
// GET ALL USERS / CUSTOMERS - ADMIN
// ======================================================

const getAllUser = async (req, res) => {
  try {
    const users = await Users.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Get order statistics for every user
    const customerStats = await Orders.aggregate([
      {
        $group: {
          _id: "$userId",

          totalOrders: {
            $sum: 1,
          },

          totalSpent: {
            $sum: "$pricing.total",
          },
        },
      },
    ]);

    // Convert stats into an easy lookup object
    const statsMap = {};

    customerStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalOrders: stat.totalOrders,
        totalSpent: stat.totalSpent,
      };
    });

    // Add order information to each customer
    const customers = users.map((user) => {
      const stats = statsMap[user._id.toString()];

      return {
        ...user,

        totalOrders: stats?.totalOrders || 0,

        totalSpent: stats?.totalSpent || 0,
      };
    });

    res.status(200).json({
      status: "success",
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
    });
  }
};

// ======================================================
// GET SINGLE USER - ADMIN
// ======================================================

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const user = await Users.findOne({
      _id: userId,
      role: "user",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user",
    });
  }
};

// ======================================================
// GET CURRENT LOGGED-IN USER
// ======================================================

const getCurrentUser = async (req, res) => {
  try {
    // Only customer ID should be used here
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Prevent admin token from being used as customer profile
    if (req.user.role === "admin") {
      return res.status(403).json({
        status: "error",
        message: "Customer access required",
      });
    }

    const user = await Users.findOne({
      _id: userId,
      role: "user",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch current user",
    });
  }
};

// ======================================================
// UPDATE USER - ADMIN
// ======================================================

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const { fullName, email, contactNumber, profileImage, status } = req.body;

    if (status && !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid customer status",
      });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

    const normalizedContact = contactNumber ? contactNumber.trim() : undefined;

    // Check duplicate email/contact
    if (normalizedEmail || normalizedContact) {
      const conditions = [];

      if (normalizedEmail) {
        conditions.push({ email: normalizedEmail });
      }

      if (normalizedContact) {
        conditions.push({
          contactNumber: normalizedContact,
        });
      }

      const existingUser = await Users.findOne({
        $or: conditions,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Email or contact number already exists",
        });
      }
    }

    const updateData = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }

    if (normalizedEmail !== undefined) {
      updateData.email = normalizedEmail;
    }

    if (normalizedContact !== undefined) {
      updateData.contactNumber = normalizedContact;
    }

    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedUser = await Users.findOneAndUpdate(
      {
        _id: userId,
        role: "user",
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user",
    });
  }
};

// ======================================================
// UPDATE CURRENT LOGGED-IN USER
// ======================================================

const updateCurrentUser = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        status: "error",
        message: "Customer access required",
      });
    }

    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const { fullName, email, contactNumber, profileImage } = req.body;

    if (!fullName || !email || !contactNumber) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email and contact number are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedContact = contactNumber.trim();

    const existingUser = await Users.findOne({
      $or: [{ email: normalizedEmail }, { contactNumber: normalizedContact }],
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email or contact number already exists",
      });
    }

    const updatedUser = await Users.findOneAndUpdate(
      {
        _id: userId,
        role: "user",
      },
      {
        fullName: fullName.trim(),
        email: normalizedEmail,
        contactNumber: normalizedContact,
        profileImage: profileImage || "",
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating current user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update profile",
    });
  }
};

// ======================================================
// DELETE USER - ADMIN
// ======================================================

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const deletedUser = await Users.findOneAndDelete({
      _id: userId,
      role: "user",
    });

    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete user",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  addUser,
  getAllUser,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
};
