const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

//load products page
const loadProducts = async (req, res) => {
  try {
    let search = req.query.search;
    let query = { delete: false };
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: "i" } },
          { "brand.brandName": { $regex: search, $options: "i" } },
        ],
        $and: [{ delete: false }],
      };
    }
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $match: query,
      },
    ]);
    res.render("products", {
      products: products,
      search: search,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//load add product page
const loadAddProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("addProduct", {
      categories: categories,
      brands: brands,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//add product
const addProduct = async (req, res) => {
  try {
    const filenames = req.files.map((file) => file.filename);

    const product = new Product({
      productName: req.body.name,
      model: req.body.model,
      description: req.body.description,
      dialColor: req.body.dialColor,
      strapColor: req.body.strapColor,
      price: Number(req.body.price),
      type: req.body.type,
      categoryId: new mongoose.Types.ObjectId(req.body.categoryId),
      brandId: new mongoose.Types.ObjectId(req.body.brandId),
      productPic1: filenames[0],
      productPic2: filenames[1],
      productPic3: filenames[2],
      stock: Number(req.body.stock),
    });

    const productData = await product.save();
    if (productData) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err.message);
  }
};

//list product
const listProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.query.productId, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
  }
};

//delete or restore products
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.query.productId, { delete: true });
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//edit product page load
const loadEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("editProduct", {
      product: product,
      categories: categories,
      brands: brands,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//edit product
const editProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.query.productId);
    const oldImage1 = oldProduct.productPic1;
    const oldImage2 = oldProduct.productPic2;
    const oldImage3 = oldProduct.productPic3;

    const filenames = req.files.map((file) => file.filename);
    const fieldnames = req.files.map((file) => file.fieldname);

    let body = {};
    for (let i = 0; i < fieldnames.length; i++) {
      body[fieldnames[i]] = filenames[i];
    }
    for (let key in req.body) {
      body[key] = req.body[key];
    }

    if ("productPic1" in body) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "products",
        oldImage1
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting old image:", err);
        }
      });
    } else if ("productPic2" in body) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "products",
        oldImage2
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting old image:", err);
        }
      });
    } else if ("productPic3" in body) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "products",
        oldImage3
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting old image:", err);
        }
      });
    }
    await Product.findByIdAndUpdate(req.query.productId, body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

module.exports = {
  loadProducts,
  loadAddProduct,
  addProduct,
  listProduct,
  deleteProduct,
  loadEditProduct,
  editProduct,
};
