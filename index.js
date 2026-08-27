require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 8080;

// MongoDB connection
require("./src/config/db");
// Routes
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.route");
const categoryRoutes = require("./src/routes/category.routes");
const productRoutes = require("./src/routes/product.routes");
const adminRoutes = require("./src/routes/admin.routes");
const orderRoute = require("./src/routes/order.route.js");
const wishlistRoutes = require("./src/routes/wishlist.routes.js");
const addressRoutes = require("./src/routes/address.routes.js");
const cartRoutes = require("./src/routes/cart.routes.js");
const couponRoutes = require("./src/routes/coupon.routes");
const reviewRoutes = require("./src/routes/review.routes");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoute);
app.use("/wishlist", wishlistRoutes);
app.use("/addresses", addressRoutes);
app.use("/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GlowCare Backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
