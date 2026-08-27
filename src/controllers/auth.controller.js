const Users = require("../models/user.model.js");
const OTP = require("../models/otp.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================================
// SEND OTP
// ======================================================

const sendOTP = async (req, res) => {
  try {
    const { email, accountType } = req.body;

    if (!email || !accountType) {
      return res.status(400).json({
        status: "error",
        message: "Email and account type are required",
      });
    }

    if (!["user", "admin"].includes(accountType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid account type",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let account;

    // ================= USER =================

    if (accountType === "user") {
      account = await Users.findOne({
        email: normalizedEmail,
      });
    }

    // ================= ADMIN =================

    if (accountType === "admin") {
      const Admins = require("../models/admin.model.js");

      account = await Admins.findOne({
        email: normalizedEmail,
      });
    }

    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Email not found",
      });
    }

    if (account.status !== "Active") {
      return res.status(403).json({
        status: "error",
        message: "Your account is inactive",
      });
    }

    // ================= OTP =================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await OTP.deleteMany({
      email: normalizedEmail,
      accountType,
      purpose: "forgot-password",
    });

    await OTP.create({
      email: normalizedEmail,
      accountType,
      otp,
      purpose: "forgot-password",
      expiresAt,
      verified: false,
    });

    console.log(
      `GlowCare ${accountType} OTP for ${normalizedEmail}: ${otp}`
    );

    res.status(200).json({
      status: "success",
      message: "OTP generated successfully",
      otp,
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to generate OTP",
    });
  }
};

// ======================================================
// VERIFY OTP
// ======================================================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, accountType } = req.body;

    if (!email || !otp || !accountType) {
      return res.status(400).json({
        status: "error",
        message: "Email, OTP and account type are required",
      });
    }

    if (!["user", "admin"].includes(accountType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid account type",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      accountType,
      purpose: "forgot-password",
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        status: "error",
        message: "OTP not found or expired",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        status: "error",
        message: "OTP has expired",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP",
      });
    }

    otpRecord.verified = true;

    await otpRecord.save();

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to verify OTP",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      newPassword,
      accountType,
    } = req.body;

    if (!email || !newPassword || !accountType) {
      return res.status(400).json({
        status: "error",
        message:
          "Email, new password and account type are required",
      });
    }

    if (!["user", "admin"].includes(accountType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid account type",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      accountType,
      purpose: "forgot-password",
      verified: true,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        status: "error",
        message: "Please verify OTP first",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        status: "error",
        message: "OTP verification has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    let updatedAccount;

    // ================= USER =================

    if (accountType === "user") {
      updatedAccount = await Users.findOneAndUpdate(
        {
          email: normalizedEmail,
        },
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      ).select("-password");
    }

    // ================= ADMIN =================

    if (accountType === "admin") {
      const Admins = require("../models/admin.model.js");

      updatedAccount = await Admins.findOneAndUpdate(
        {
          email: normalizedEmail,
        },
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      ).select("-password");
    }

    if (!updatedAccount) {
      return res.status(404).json({
        status: "error",
        message:
          accountType === "admin"
            ? "Admin not found"
            : "User not found",
      });
    }

    await OTP.deleteMany({
      email: normalizedEmail,
      accountType,
      purpose: "forgot-password",
    });

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to reset password",
    });
  }
};

// ======================================================
// USER LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await Users.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        status: "error",
        message: "Your account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // ==================================================
    // JWT
    // ==================================================

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ==================================================
    // USER RESPONSE
    // ==================================================

    const userResponse = user.toObject();

    delete userResponse.password;

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      data: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
};

// ======================================================
// GET CURRENT LOGGED-IN USER
// ======================================================

const getCurrentUser = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch current user",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  login,
  getCurrentUser,
  sendOTP,
  verifyOTP,
  resetPassword,
};