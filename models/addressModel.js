const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    streetAddress: {
        type: String,
        required: true,
    },
    pinCode: {
        type: Number,
        required: true,
    },
    phone: {
        type: Number,
        unique: true,
        index: true,
    }
});

module.exports = mongoose.model('Address', AddressSchema, 'address');