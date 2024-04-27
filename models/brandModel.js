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
    }
});

module.exports = mongoose.model('Brand', BrandSchema, 'brands');