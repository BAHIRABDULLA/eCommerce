const mongoose = require('mongoose')
const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
    ,
    expireDate: {
        type: Date
    },
    discountAmount: {
        type: Number
    },
    active: {
        type: Boolean,
        default: true
    }

})

module.exports = mongoose.model('Coupon', couponSchema)