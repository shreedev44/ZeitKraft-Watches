const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const fs = require("fs");
const path = require("path");

//load categories page
const loadCategories = async (req, res) => {
  try {
    let search = req.query.search;
    let page = req.query.page || 1;
    const limit = 6;
    const skip = (page - 1) * 6;
    let query = { delete: false };
    if (search) {
      query = {
        categoryName: { $regex: search, $options: "i" },
        delete: false,
      };
    }
    let totalPages = await Category.find(query).countDocuments();
    totalPages = Math.ceil(totalPages / limit);
    const categories = await Category.find(query).skip(skip).limit(limit);
    res.render("categories", {
      categories: categories,
      search: search,
      page: page,
      totalPages: totalPages,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//load add category page
const loadAddCategories = async (req, res) => {
  try {
    res.render("addCategories", { name: req.session.admin });
  } catch (err) {
    console.log(err.message);
  }
};

//adding category
const addCategory = async (req, res) => {
  try {
    const { filename } = req.file;
    const categoryName = req.body.title;

    const isExisting = await Category.find({ categoryName: categoryName });
    if (isExisting.length == 0) {
      const category = new Category({
        categoryName: categoryName,
        categoryPic: filename,
        delete: false,
      });

      const categoryData = await category.save();
      if (categoryData) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    } else {
      res.status(400).json({ error: "Category already exists" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//load edit category page
const loadEditCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;

    const category = await Category.findById(categoryId);
    res.render("editCategory", { category: category, name: req.session.admin });
  } catch (err) {
    console.log(err.message);
  }
};

//edit category
const editCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const oldCategory = await Category.findById(categoryId);
    const oldImage = oldCategory.categoryPic;

    const editBody = {};
    if (req.body.title) {
      editBody.categoryName = req.body.title;
    }
    if (req.file) {
      editBody.categoryPic = req.file.filename;
    }
    const isExisting = await Category.findOne({ categoryName: req.body.title });
    if (isExisting) {
      res.status(400).json({ error: "Category already exist" });
    } else {
      await Category.findByIdAndUpdate(categoryId, editBody);
      if (req.file) {
        if (oldImage) {
          const imagePath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            "categories",
            oldImage
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.log("Error deleting old image:", err);
            }
          });
        }
      }
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//list and unlist category
const listCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.query.categoryId, req.body);
    await Product.updateMany({ categoryId: req.query.categoryId }, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//delete category
const deleteCategory = async (req, res) => {
  try {
    const productExist = await Product.find({
      categoryId: req.query.categoryId,
    });
    if (productExist.length > 0) {
      res
        .status(400)
        .json({
          error:
            "There are products under this category so it can't be deleted",
        });
    } else {
      await Category.findByIdAndUpdate(req.query.categoryId, { delete: true });
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(200);
  }
};

module.exports = {
  loadCategories,
  loadAddCategories,
  addCategory,
  loadEditCategory,
  editCategory,
  listCategory,
  deleteCategory,
};
