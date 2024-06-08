const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    transactionHistory: [
        {
            amount: {
                type: Number
            },
            type: {
                type: String
            },
            date: {
                type: Date
            },
            description: {
                type: String
            }
        }
    ]
});

module.exports = mongoose.model('Wallet', WalletSchema, 'wallet');