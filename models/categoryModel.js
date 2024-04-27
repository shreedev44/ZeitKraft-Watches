const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    categoryPic: {
        type: String,
        required: true,
    },
    delete: {
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.model('Category', CategorySchema, 'categories');