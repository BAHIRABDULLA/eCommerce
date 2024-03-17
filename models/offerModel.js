const mongoose=require('mongoose')
const offerSchema=mongoose.Schema({
    title:{
        type:String,
        reqiured:true
    },
    description:{
        type:String
    },
    discountPercentage:{
        type:Number,
        required:true,
        min:0,
        max:100
    },
    startDate:{
        type:Date,
        required:true
    },
    expireDate:{
        type:Date,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model('Offer',offerSchema)