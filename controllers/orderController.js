const Order = require('../models/orderModel');
const Product = require('../models/productModel');



//     order cancel working 
const userOrderCancel = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const products = await Order.findOne({ _id: orderId }, { 'products.productId': 1, 'products.quantity': 1 })
        if (products && products.products.length > 0) {
            for (let product of products.products) {
                const productId = product.productId
                const quantity = product.quantity

                await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } })
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

        res.json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.json({ message: 'Internal server error' });
    }
}


//     order return working
const userReturnOrder = async (req, res) => {
    try {
        const { orderId } = req.params
        const { reason } = req.body

        const updateOrder = await Order.findByIdAndUpdate(orderId, { status: 'Returned', returnReason: reason }, { new: true })
        const products = await Order.findOne({ _id: orderId }, { 'products.productId': 1, 'products.quantity': 1 })
        if (products && products.products.length > 0) {
            for (let product of products.products) {
                let productId = product.productId
                let quantity = product.quantity

                let updateProductQuantity = await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } })
                console.log(updateProductQuantity, 'updateCart Quanttiy iin userRetrun order');
            }
        }
        res.json({ message: 'Order returned successfully', order: updateOrder })
    } catch (error) {
        console.error(error.message);
    }
}


module.exports = {
    userOrderCancel,
    userReturnOrder

}