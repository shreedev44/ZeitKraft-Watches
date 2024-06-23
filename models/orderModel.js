const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    OID: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            subTotal: {
                type: Number,
                required: true,
            },
            status: {
                type: String,
                required: true,
            },
            deliveryDate: {
                type: Date,
                required: true,
            },
            lastUpdated: {
                type: Date,
                required: true,
            },
            reasonForCancel: {
                type: String
            },
            reasonForReturn: {
                type: String
            },
            complete: {
                type: Boolean,
                required: true,
                default: false
            }
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
    discountAmount: {
        type: Number,
    },
    offerDiscount: {
        type: Number,
    },
    couponId: {
        type: mongoose.Types.ObjectId,
    },
    couponMinPurchase: {
        type: Number,
    },
    couponMaxRedeem: {
        type: Number,
    },
    couponOfferPercent: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Order', OrderSchema, 'orders');