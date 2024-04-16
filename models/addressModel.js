const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: [{
        name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        streetAddress: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        landmark: {
            type: String

        },
        phone2: {
            type: Number

        }
    }]

})

module.exports = mongoose.model('Address', addressSchema)
