require("dotenv").config();

const express = require("express");
const app = express();

const PORT = 8080;

require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.route");
const categoryRoutes = require("./src/routes/category.routes");
const productRoutes = require("./src/routes/product.routes");

app.use(express.json());

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);

app.get("/redirect", (req, res) => {
  res.redirect("https://www.w3schools.com/");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});