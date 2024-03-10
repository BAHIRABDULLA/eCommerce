const Cart=require('../models/cartModel')
const Product=require('../models/productModel')


// const addToCart =async (req,res)=>{
//     try {
//         console.log('reached add to cart function');
//         const userId=req.session.user_id
//         console.log(userId,'got userId in add to cart function');
//         const productId=req.body.productId
//         console.log(productId,'got productId in add to cart function');

//         let cart = await Cart.findOne({userId:userId})
//         console.log(cart,'this is cart');

//         if(!cart){
//             console.log('add to cart if condition ');
//             const newCart=new Cart({
//                 userId:userId,
//                 products:[{productId:productId}]
//             })
//             await newCart.save()
//         }else{
//             console.log('add to cart else condition ');
//             cart.products.push({productId:productId})
//             await cart.save()
//         }

//     } catch (error) {
//         console.log(error.message);
//     }
// }



module.exports={
    // addToCart
}