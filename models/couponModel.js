const mongoose=require('mongoose')
const couponSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true,
        unique:true
    },
    discription:{
        type:String
    }
    ,
    expireDate:{
        type:Date
    },
    discountAmount:{
        type:Number
    },
    active:{
        type:Boolean,
        default:true
    }
    
})

module.exports=mongoose.model('Coupon',couponSchema)