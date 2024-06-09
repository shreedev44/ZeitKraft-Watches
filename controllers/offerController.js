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

//add coupone
const addCoupon = async (req, res) => {
  try {
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

module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupon,
};
