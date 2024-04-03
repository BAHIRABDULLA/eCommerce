const Order=require('../models/orderModel');
const Product = require('../models/productModel');

console.log('its in order controller funciotn ');


const userOrderCancel=async (req,res)=>{
    try {
        const { orderId } = req.params;
        console.log(orderId,'order id in userOrder cancel ');
        const { reason } = req.body;
        console.log(reason,'reason in userorder cancel function ');

        // Update order status and store cancellation reason
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
        res.json({message:'Order returned successfully',order:updateOrder})
    } catch (error) {
        console.error(error.message);
    }
}


module.exports={
    userOrderCancel,
    userReturnOrder,

}