const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    transactionAmount: [
        {
            type: Number,
        }
    ],
    transactionType: [
        {
            type: String,
        }
    ],
    transactionDate: [
        {
            type: Date
        }
    ],
    transactionDescription: [
        {
            type: String
        }
    ]
});

module.exports = mongoose.model('Wallet', WalletSchema, 'wallet');