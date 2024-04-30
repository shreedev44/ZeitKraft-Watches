const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    brandPic: {
        type: String,
        required: true,
    },
    delete: {
        type: Boolean,
        required: true,
    },
    listed: {
        type: Boolean,
        required: true,
        default: true,
    },
});

module.exports = mongoose.model('Brand', BrandSchema, 'brands');