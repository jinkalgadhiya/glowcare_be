const express = require("express");
const app = express();
const PORT = 8080;

const authRoutes = require("./src/routes/auth.routes"); // adjust path if needed

app.use("/", authRoutes);

app.get("/redirect", (req, res) => {
    res.redirect("https://www.w3schools.com/");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});