const Coupon = require("../models/couponModel");

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

module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupon,
  listCoupon,
};
