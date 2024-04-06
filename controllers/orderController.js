const Order=require('../models/orderModel');
const Product = require('../models/productModel');

console.log('its in order controller funciotn ');


const userOrderCancel=async (req,res)=>{
    try {
        const { orderId } = req.params;
        console.log(orderId,'order id in userOrder cancel ');
        const { reason } = req.body;
        console.log(reason,'reason in userorder cancel function ');
        const products= await Order.findOne({_id:orderId},{'products.productId':1,'products.quantity':1})
        console.log(products,'products in userOrdercancel ');
        if(products && products.products.length>0){
            for(let product of products.products){
                const productId=product.productId
                const quantity=product.quantity

                const updateProductQuantity=await Product.findByIdAndUpdate(productId,{$inc:{quantity:quantity}})
                // console.log(updateProductQ,'updateProductQuantity');
            }
        }

        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'Cancelled', cancelReason: reason },
            { new: true }
        );
        

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}




const userReturnOrder=async(req,res)=>{
    try {
        console.log(('its  in userreturn order'));
        const {orderId}=req.params
        const {reason}=req.body
        console.log(reason,'reason');
        
        const updateOrder= await Order.findByIdAndUpdate(orderId,{status:'Returned',returnReason:reason},{new:true})
        const products=await Order.findOne({_id:orderId},{'products.productId':1,'products.quantity':1})
        console.log(products,'products in userReturn Order');
        if(products&&products.products.length>0){
            // products.products.forEach((product)=>{
            for(let product of products.products){
                let productId=product.productId
                let quantity=product.quantity

                let updateProductQuantity=await Product.findByIdAndUpdate(productId,{$inc:{quantity:quantity}})
                console.log(updateProductQuantity,'updateCart Quanttiy iin userRetrun order');
            }
        }
        
        // if(order.paymentMethod==='Cash on Delivery'){
            
        // }
        res.json({message:'Order returned successfully',order:updateOrder})
    } catch (error) {
        console.error(error.message);
    }
}




module.exports={
    userOrderCancel,
    userReturnOrder,

}