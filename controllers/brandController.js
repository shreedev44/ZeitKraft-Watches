const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const path = require("path");
const fs = require("fs");

//load brands page
const loadBrands = async (req, res) => {
  try {
    let search = req.query.search;
    let page = req.query.page || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    let query = { delete: false };
    if (search) {
      query = {
        brandName: { $regex: search, $options: "i" },
        delete: false,
      };
    }
    let totalPages = await Brand.find(query).countDocuments();
    totalPages = Math.ceil(totalPages / limit);
    const brands = await Brand.find(query).skip(skip).limit(limit);
    res.render("brands", {
      brands: brands,
      search: search,
      page: page,
      totalPages: totalPages,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//load add brand page
const loadAddBrand = async (req, res) => {
  try {
    res.render("addBrand", { name: req.session.admin });
  } catch (err) {
    console.log(err.message);
  }
};

//add brand
const addBrand = async (req, res) => {
  try {
    const { filename } = req.file;
    const brandName = req.body.title;

    const isExisting = await Brand.find({ brandName: brandName });
    if (isExisting.length == 0) {
      const brand = new Brand({
        brandName: brandName,
        brandPic: filename,
        delete: false,
      });

      const brandData = await brand.save();
      if (brandData) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    } else {
      res.status(400).json({ error: "Brand already exists" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//load edit brand page
const loadEditBrand = async (req, res) => {
  try {
    const brandId = req.query.brandId;

    const brand = await Brand.findById(brandId);
    res.render("editBrand", { brand: brand, name: req.session.admin });
  } catch (err) {
    console.log(err.message);
  }
};

//edit brand
const editBrand = async (req, res) => {
  try {
    const brandId = req.query.brandId;
    const oldBrand = await Brand.findById(brandId);
    const oldImage = oldBrand.brandPic;

    const editBody = {};
    if (req.body.title) {
      editBody.brandName = req.body.title;
    }
    if (req.file) {
      editBody.brandPic = req.file.filename;
    }
    const isExisting = await Brand.findOne({ brandName: req.body.title });
    if (!isExisting) {
      await Brand.findByIdAndUpdate(brandId, editBody);
      if (req.file) {
        if (oldImage) {
          const imagePath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            "brands",
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
    } else {
      res.status(400).json({ error: "Brand already exist" });
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//delete brand
const deleteBrand = async (req, res) => {
  try {
    const productExist = Product.findOne({ brandId: req.query.brandId });
    if (productExist) {
      res
        .status(400)
        .json({
          error: "There are products under this brand so it can't be deleted",
        });
    } else {
      await Brand.findByIdAndUpdate(req.query.brandId, { delete: true });
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//list and unlist brand
const listBrand = async (req, res) => {
  try {
    await Brand.findByIdAndUpdate(req.query.brandId, req.body);
    await Product.updateMany({ brandId: req.query.brandId }, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

module.exports = {
  loadBrands,
  loadAddBrand,
  addBrand,
  loadEditBrand,
  editBrand,
  deleteBrand,
  listBrand,
};
