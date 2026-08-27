const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/authMiddleware");

router.post("/login", authController.login);

router.get(
  "/me",
  checkAuth,
  authController.getCurrentUser
);

router.post(
  "/send-otp",
  authController.sendOTP
);

router.post(
  "/verify-otp",
  authController.verifyOTP
);

router.post(
  "/reset-password",
  authController.resetPassword
);

module.exports = router;