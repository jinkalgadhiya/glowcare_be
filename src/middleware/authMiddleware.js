const jwt = require("jsonwebtoken");

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

const checkAuth = (req, res, next) => {
  try {
    // ==================================================
    // GET AUTHORIZATION HEADER
    // ==================================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Authorization token is required",
      });
    }

    // ==================================================
    // CHECK BEARER FORMAT
    // ==================================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authorization token is missing",
      });
    }

    // ==================================================
    // VERIFY JWT
    // ==================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==================================================
    // GET AUTHENTICATED ACCOUNT ID
    // ==================================================

    const accountId =
      decoded.userId ||
      decoded.adminId ||
      decoded.id ||
      decoded._id;

    if (!accountId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token",
      });
    }

    // ==================================================
    // STORE AUTHENTICATION DATA
    // ==================================================

    req.user = {
      id: accountId,
      userId: decoded.userId || null,
      adminId: decoded.adminId || null,
      role: decoded.role || "user",
    };

    // ==================================================
    // CONTINUE
    // ==================================================

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  checkAuth,
};