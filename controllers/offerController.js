const Coupon = require('../models/couponModel');

//load coupons page
const loadCoupons = async (req, res) => {
    try{
        res.render('coupons', {name: req.session.admin, brands: [], search: ''});
    }
    catch(err){
        console.log(err);
    }
}

//load add coupons page
const loadAddCoupon = async (req, res) => {
    try{
        res.render("addCoupon", {name: req.session.admin});
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {
    loadCoupons,
    loadAddCoupon,
}