const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    }

})



module.exports = mongoose.model('User', userSchema)