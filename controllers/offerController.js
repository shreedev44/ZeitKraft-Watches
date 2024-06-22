const Coupon = require("../models/couponModel");
const Offer = require("../models/offerModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const { findOne } = require("../models/adminModel");

//load coupons page
const loadCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render("coupons", {
      name: req.session.admin,
      coupons: coupons,
      search: "",
    });
  } catch (err) {
    console.log(err);
  }
};

//load add coupons page
const loadAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon", { name: req.session.admin });
  } catch (err) {
    console.log(err);
  }
};

//add coupon
const addCoupon = async (req, res) => {
  try {
    const existing = await Coupon.findOne({couponCode: req.body.couponCode});
    if(existing){
      res.status(400).json({message: "Coupon code already exist"});
      return;
    }
    const coupon = new Coupon(req.body);
    const couponData = await coupon.save();
    if (couponData) {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//coupon listing and unlisting
const listCoupon = async (req, res) => {
  try{
    await Coupon.findByIdAndUpdate(req.body.couponId, {listed: req.body.action});
    res.sendStatus(200)
  }
  catch(err){
    console.log(err);
    res.sendStatus(500);
  }
}

//load offer page
const loadOffer = async(req, res) => {
  try{
    const offers = await Offer.find();
    res.render("offers", { name: req.session.admin, coupons: [] });
  }
  catch(err){
    console.log(err);
  }
}

//load add offer page
const loadAddOffer = async (req, res) => {
  try{
    res.render("addOffer", { name: req.session.admin });
  }
  catch(err){
    console.log(err);
  }
}

//fetching entities
const fetchEntity = async (req, res) => {
  try{
    const { entityOf } = req.query;
    let entities;
    if(entityOf == 'category'){
      entities = await Category.aggregate([
        { $match: { listed: true, delete: false } },
        {
          $project: {
            name: "$categoryName",
          }
        }
      ]);
    }
    else if(entityOf == 'product'){
      entities = await Product.aggregate([
        { $match: { listed: true, delete: false } },
        {
          $lookup: {
            from: "brands",
            localField: "brandId",
            foreignField: "_id",
            as: "brand",
          }
        },
        { $unwind: "$brand" },
        {
          $project: {
            name: {
              $concat: [
                "$brand.brandName",
                " ",
                "$productName",
              ],
            },
          }
        }
      ]);
    }
    else if(entityOf == 'brand'){
      entities = await Brand.aggregate([
        { $match: { listed: true, delete: false } },
        {
          $project: {
            name: "$brandName"
          }
        }
      ]);
    }
    else{
      return res.sendStatus(404)
    }
    res.status(200).json({entities: entities});
  }
  catch(err){
    console.log(err);
  }
}

//adding offer
const addOffer = async (req, res) => {
  try{
    const {
      offerPercent,
      categoryId,
      productId,
      brandId,
    } = req.body;

    if(categoryId){
      await Category.findByIdAndUpdate(categoryId, {$set: {offerPercent: offerPercent}});
    }
    else if(brandId){
      await Brand.findByIdAndUpdate(brandId, {$set: {offerPercent: offerPercent}});
    }
    else if(productId){
      await Product.findByIdAndUpdate(brandId, {$set: {offerPercent: offerPercent}})
    }

    const offer = new Offer(req.body);
    const offerData = await offer.save();

    if(offerData){
      res.sendStatus(200);
    }
  }
  catch(err){
    console.log(err);
    res.sendStatus(500);
  }
}

//activate and deactivate offer
const activateOffer = async (req, res) => {
  try{
    const {action, offerId} = req.body;
    const offer = await findOne({_id: offerId});
    if(!offer){
      res.status(404).json({message: "Offer not found"});
    }
    let updateStatement;
    if(action){
      updateStatement = {$set: { offerPercent: offer.offerPercent }}
    }
    else{
      updateStatement = {$unset: { offerPercent: '' }}
    }
    if(offer.productId){
      await Product.findByIdAndUpdate(offer.productId, updateStatement);
    }
    else if(offer.brandId){
      await Brand.findByIdAndUpdate(offer.brandId, updateStatement);
    }
    else if(offer.categoryId){
      await Category.findByIdAndUpdate(offer.categoryId, updateStatement);
    }
    res.sendStatus(200)
  }
  catch(err){
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupon,
  listCoupon,
  loadOffer,
  loadAddOffer,
  fetchEntity,
  addOffer,
  activateOffer,
};
