const express = require("express");

const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller.js");

// Create Category
router.post("/", createCategory);

// Get All Categories
router.get("/", getAllCategories);

// Get Single Category
router.get("/:id", getSingleCategory);

// Update Category
router.put("/:id", updateCategory);

// Delete Category
router.delete("/:id", deleteCategory);

module.exports = router;