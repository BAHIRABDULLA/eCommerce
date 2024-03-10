const mongoose=require('mongoose')

const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products:[{
        productId:{
            type:mongoose.Schema.ObjectId,
            ref:'Product'
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number
        },
        totalPrice:{
            type:Number
        }

    }]

})
module.exports=mongoose.model('Cart',cartSchema)