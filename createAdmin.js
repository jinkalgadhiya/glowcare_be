require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admins = require("./src/models/admin.model");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_DIRECT);

    console.log("Database connected");

    const adminEmail = "admin@glowcare.com";
    const adminPassword = "Admin@123456";

    const existingAdmin = await Admins.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    const admin = await Admins.create({
      fullName: "GlowCare Admin",
      email: adminEmail,
      contactNumber: "9999999999",
      password: hashedPassword,
      status: "Active",
      image: "",
    });

    console.log("Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};

createAdmin();