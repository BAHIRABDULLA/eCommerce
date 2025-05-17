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
    criteriaAmount:{
        type:Number
    },
    active: {
        type: Boolean,
        default: true
    },
    usedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]



})

module.exports = mongoose.model('Coupon', couponSchema)