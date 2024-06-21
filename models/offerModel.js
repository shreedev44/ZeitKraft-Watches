const mongoose = require('mongoose');

const OfferSchema = mongoose.Schema({
    offerName: {
        type: String,
        required: true,
    },
    offerPrecent: {
        type: Number,
        required: true,
    },
    offerType: {
        type: String,
        required: true,
    },
    entityName: {
        type: String,
        required: true,
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
    },
    productId: {
        type: mongoose.Types.ObjectId,
    },
    brandId: {
        type: mongoose.Types.ObjectId,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Offer", OfferSchema, 'offer');