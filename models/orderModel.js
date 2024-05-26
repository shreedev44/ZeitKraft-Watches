const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    products: [
        {
            type: mongoose.Types.ObjectId,
            required: true,
        }
    ],
    quantity: [
        {
            type: Number,
            required: true,
        }
    ],
    addressId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
        required: true,
        default: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    taxCharge: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        required: true,
        default: 60,
    },
    totalCharge: {
        type: Number,
        required: true,
    },
    couponId: {
        type: mongoose.Types.ObjectId,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Placed',
    },
    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema, 'orders');