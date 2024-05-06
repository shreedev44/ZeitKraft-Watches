const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
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
        required: true,
    },
    delete: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Address', AddressSchema, 'address');