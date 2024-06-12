const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
    },
    offerPercent: {
        type: Number,
        required: true,
    },
    minPurchase: {
        type: Number,
        required: true,
    },
    maxRedeem: {
        type: Number,
        required: true,
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true,
        expires: 0,
    },
    listed: {
        type: Boolean,
        required: true,
        default: true,
    }
});

module.exports = mongoose.model("Coupon", CouponSchema, "coupons")