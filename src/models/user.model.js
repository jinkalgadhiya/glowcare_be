const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= USER INFORMATION =================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ================= AUTHENTICATION =================

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ================= ACCOUNT =================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ================= PROFILE =================

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("User", userSchema);

module.exports = Users;