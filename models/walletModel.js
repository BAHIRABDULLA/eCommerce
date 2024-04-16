const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transactions: [{
        type: {
            type: String,
            enum: ['credit', 'debit'],
        },
        reason: {
            type: String,
            required: true,
            enum: ['added money to wallet', 'purchased product', 'refund', 'referral']
        },
        date: {
            type: Date,
            default: Date.now
        },
        transactionAmount: {
            type: Number,
            required: true
        }
    }]
})

module.exports = mongoose.model('Wallet', walletSchema)