const mongoose=require('mongoose');
const Address = require('../models/addressModel')

const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
   products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        name:{
            type:String,
            required:true
        },
        quantity:{
            type:Number,
            required:true

        }
   }]
   ,
    orderUserDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        enum:['Wallet','Cash on Delivery','Online Payment'],
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        enum:['Delivered','Shipping','Pending','Cancelled','Returned'],
        default:'Pending'
    },
    cancelReason:{
        type:String
    },
    returnReason:{
        type:String
    },
    couponApplied:{
        type:Number,
        ref:'Coupon'
    },
    offerApplied:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Offer'
    }

})
module.exports=mongoose.model('Order',orderSchema)