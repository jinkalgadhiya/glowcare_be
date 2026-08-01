const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/authMiddleware");

router.get("/login", checkAuth, authController.login);

module.exports = router;