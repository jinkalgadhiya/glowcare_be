const Category = require("../models/category.model.js");
const Product = require("../models/product.model.js");

// ===============================
// Create Category
// ===============================
const createCategory = async (req, res) => {
  try {
    const {
      menuType,
      categoryType,
      mainCategory,
      subCategory,
      description,
      bannerImage,
      status,
    } = req.body;

    // Required fields
    if (!menuType || !categoryType || !mainCategory) {
      return res.status(400).json({
        status: "error",
        message:
          "Menu type, category type and main category are required",
      });
    }

    // If this is a sub category, subCategory is required
    if (categoryType === "sub" && !subCategory?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Sub category is required",
      });
    }

    // ===============================
    // Duplicate Check
    // ===============================

    const duplicateQuery = {
      menuType: menuType.trim(),
      categoryType: categoryType.trim(),
      mainCategory: mainCategory.trim(),
    };

    // For sub categories, also check subCategory
    if (categoryType === "sub") {
      duplicateQuery.subCategory = subCategory.trim();
    }

    const existingCategory = await Category.findOne(duplicateQuery);

    if (existingCategory) {
      return res.status(409).json({
        status: "error",
        message: "This category already exists",
      });
    }

    // ===============================
    // Create Category
    // ===============================

    const newCategory = new Category({
      menuType: menuType.trim(),
      categoryType: categoryType.trim(),
      mainCategory: mainCategory.trim(),
      subCategory:
        categoryType === "sub" ? subCategory.trim() : "",
      description: description?.trim() || "",
      bannerImage: bannerImage?.trim() || "",
      status: status || "Active",
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to create category",
    });
  }
};

// ===============================
// Get All Categories
// ===============================
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
    });
  }
};

// ===============================
// Get Single Category
// ===============================
const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    console.error("Get single category error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch category",
    });
  }
};

// ===============================
// Update Category
// ===============================
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      menuType,
      categoryType,
      mainCategory,
      subCategory,
      description,
      bannerImage,
      status,
    } = req.body;

    // Required fields
    if (!menuType || !categoryType || !mainCategory) {
      return res.status(400).json({
        status: "error",
        message:
          "Menu type, category type and main category are required",
      });
    }

    // Sub category required for sub category type
    if (categoryType === "sub" && !subCategory?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Sub category is required",
      });
    }

    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // ===============================
    // Duplicate Check
    // ===============================

    const duplicateQuery = {
      menuType: menuType.trim(),
      categoryType: categoryType.trim(),
      mainCategory: mainCategory.trim(),
      _id: { $ne: id },
    };

    if (categoryType === "sub") {
      duplicateQuery.subCategory = subCategory.trim();
    }

    const duplicateCategory = await Category.findOne(
      duplicateQuery
    );

    if (duplicateCategory) {
      return res.status(409).json({
        status: "error",
        message: "Another category with the same details already exists",
      });
    }

    // ===============================
    // Update
    // ===============================

    existingCategory.menuType = menuType.trim();
    existingCategory.categoryType = categoryType.trim();
    existingCategory.mainCategory = mainCategory.trim();

    existingCategory.subCategory =
      categoryType === "sub"
        ? subCategory.trim()
        : "";

    existingCategory.description =
      description?.trim() || "";

    existingCategory.bannerImage =
      bannerImage?.trim() || "";

    existingCategory.status =
      status || existingCategory.status;

    const updatedCategory = await existingCategory.save();

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to update category",
    });
  }
};

// ===============================
// Delete Category
// ===============================
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category first
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    // ==========================================
    // CASE 1: Delete SUB CATEGORY
    // ==========================================

    if (category.categoryType === "sub") {
      // Delete all products belonging to this sub category
      await Product.deleteMany({
        category: category._id,
      });

      // Delete the sub category
      await Category.findByIdAndDelete(category._id);

      return res.status(200).json({
        status: "success",
        message:
          "Sub category and its products deleted successfully",
      });
    }

    // ==========================================
    // CASE 2: Delete MAIN CATEGORY
    // ==========================================

    if (category.categoryType === "main") {
      // Find all sub categories belonging to this main category
      const subCategories = await Category.find({
        categoryType: "sub",
        menuType: category.menuType,
        mainCategory: category.mainCategory,
      });

      // Get all sub category IDs
      const subCategoryIds = subCategories.map(
        (subCategory) => subCategory._id
      );

      // Delete products belonging to those sub categories
      if (subCategoryIds.length > 0) {
        await Product.deleteMany({
          category: {
            $in: subCategoryIds,
          },
        });
      }

      // Delete all sub categories
      await Category.deleteMany({
        _id: {
          $in: subCategoryIds,
        },
      });

      // Finally delete the main category
      await Category.findByIdAndDelete(category._id);

      return res.status(200).json({
        status: "success",
        message:
          "Main category, sub categories and products deleted successfully",
      });
    }

    // ==========================================
    // Fallback
    // ==========================================

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to delete category",
    });
  }
};

// ===============================
// Export
// ===============================
module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};