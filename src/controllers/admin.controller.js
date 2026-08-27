const Admins = require("../models/admin.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// Admin Login
// ===============================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const admin = await Admins.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        status: "error",
        message: "Invalid admin email or password",
      });
    }

    if (admin.status !== "Active") {
      return res.status(403).json({
        status: "error",
        message: "Admin account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid admin email or password",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const adminResponse = admin.toObject();

    delete adminResponse.password;

    res.status(200).json({
      status: "success",
      message: "Admin login successful",
      token,
      data: adminResponse,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      status: "error",
      message: "Admin login failed",
    });
  }
};

// ===============================
// Get Current Admin
// ===============================
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admins.findById(req.user.adminId).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching admin:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch admin",
    });
  }
};

// ===============================
// Update Admin Profile
// ===============================
const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, email, contactNumber, image } = req.body;

    if (!fullName || !email || !contactNumber) {
      return res.status(400).json({
        status: "error",
        message: "Full name, email and contact number are required",
      });
    }

    const admin = await Admins.findById(req.user.adminId);

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    // Check if another admin is already using this email
    const existingEmail = await Admins.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: admin._id },
    });

    if (existingEmail) {
      return res.status(409).json({
        status: "error",
        message: "Email is already being used by another admin",
      });
    }

    // Check if another admin is already using this contact number
    const existingContact = await Admins.findOne({
      contactNumber: contactNumber.trim(),
      _id: { $ne: admin._id },
    });

    if (existingContact) {
      return res.status(409).json({
        status: "error",
        message: "Contact number is already being used by another admin",
      });
    }

    admin.fullName = fullName.trim();
    admin.email = email.toLowerCase().trim();
    admin.contactNumber = contactNumber.trim();
    admin.image = image || "";

    await admin.save();

    const adminResponse = admin.toObject();

    delete adminResponse.password;

    res.status(200).json({
      status: "success",
      message: "Admin profile updated successfully",
      data: adminResponse,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update admin profile",
    });
  }
};

// ===============================
// Change Admin Password
// ===============================
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    const admin = await Admins.findById(req.user.adminId);

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    // Check current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Prevent using the same password
    const samePassword = await bcrypt.compare(
      newPassword,
      admin.password
    );

    if (samePassword) {
      return res.status(400).json({
        status: "error",
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;

    await admin.save();

    res.status(200).json({
      status: "success",
      message: "Admin password updated successfully",
    });
  } catch (error) {
    console.error("Change admin password error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update admin password",
    });
  }
};

module.exports = {
  adminLogin,
  getCurrentAdmin,
  updateAdminProfile,
  changeAdminPassword,
};