const mongoose = require('mongoose')

const adminModel = new mongoose.Schema({
    email:{
        type:String
    },
    password:{
        type:String
    }
})
module.exports=mongoose.model('Admin',adminModel)