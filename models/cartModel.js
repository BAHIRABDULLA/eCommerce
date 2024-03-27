const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
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
        }
    }]

})
module.exports=mongoose.model('Cart',cartSchema)