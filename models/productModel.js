const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        index: true,
    },
    model: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    dialColor: {
        type: String,
        required: true,
        index: true,
    },
    strapColor: {
        type: String,
        required: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        index: true,
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    brandId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    productPic1: {
        type: String,
        required: true,
    },
    productPic2: {
        type: String,
        required: true,
    },
    productPic3: {
        type: String,
        required: true,
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    delete: {
        type: Boolean,
        required: true,
        default: false,
    },
    listed: {
        type: Boolean,
        required: true,
        default: true,
    },
    reviewsId: [
        {
            type: mongoose.Schema.Types.ObjectId,
        },
    ],
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    offerPercent: {
        type: Number,
    }
});

module.exports = mongoose.model('Product', ProductSchema, 'products');