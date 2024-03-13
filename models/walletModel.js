const mongoose=require('mongoose')
const walletSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        default:0
    },
    transactions:[{
        type:String,
        enum:['credit','debit']
    }]

})

module.exports=mongoose.model('Wallet',walletSchema)