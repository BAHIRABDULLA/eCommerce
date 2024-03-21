const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')

const productLoad = async (req, res) => {
    try {
        const errorMessages=req.flash('error')
        const products = await Product.find().populate('category')
        res.render('products', { products,errorMessages })
        console.log('product load is working ');
    } catch (error) {
        console.log(error.message);
    }
}


const addProductLoad = async (req, res) => {
    try {
        const products = await Product.find()
        const categories = await Category.find({ status: true })
        console.log(products);
        res.render('productAdd', { products, categories })
    } catch (error) {
        console.log(error.message);
    }
}

const insertProduct = async (req, res) => {
    try {
        console.log('insertProduct page');
        const { name, category, quantity, size, price, description } = req.body
        const existingProduct=await Product.findOne({name})
        if(existingProduct){
            req.flash('error','A product with the same name already exists')
            return res.redirect("/admin/products")
        }
        const imagePath = req.files.map(file => file.filename)


        const product = new Product({
            name,
            category,
            quantity,
            size,
            price,
            image: imagePath,
            description
        })
        const update = await product.save()
        console.log(update);
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

const EditProductLoad = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId);
        const categories = await Category.find({ status: true })
        // const products=await Product.find()
        res.render('productEdit', { categories, product })
    } catch (error) {
        console.log(error.message);
    }
}

// const editProduct = async (req, res) => {
//     try {
//         const productId = req.params.productId;
//         const { name, category, price, quantity, size, description } = req.body
//         const updateImages=req.files.map(file=>file.filename)
//         console.log(req.body.description, 'body description');
//         const update = await Product.findByIdAndUpdate(productId, { name, category, price, quantity, size, description })
//         console.log(update);
//         res.redirect('/admin/products')
//     } catch (error) {
//         console.log(error.message);
//     }
// }



const editProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, category, price, quantity, size, description } = req.body;
        const updateImages = req.files.map(file => file.filename);
        
        const product = await Product.findById(productId);
        product.name = name;
        product.category = category;
        product.price = price;
        product.quantity = quantity;
        product.size = size;
        product.description = description;
        if (updateImages.length > 0) {
            product.image = updateImages;
        }
        await product.save();

        console.log('Product updated successfully:', product);
        res.redirect('/admin/products');
    } catch (error) {
        console.log('Error updating product:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const deleteProduct = async (req, res) => {
    try {
        console.log('deleteProduct page is here');
        const productId = req.params.id
        await Product.findByIdAndDelete({_id:productId})
        console.log(productId);
        res.redirect('/admin/products')
    } catch (error) {

        console.log(error.message);
    }
}


const updateProductStatus = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        product.status = !product.status

        res.json({ status: product.status })

        await product.save()
    } catch (error) {
        console.log(error.message);
    }
}


// const loadOrder = async (req, res) => {
//     try {
//         console.log('Starting here...');
//         const orders = await Order.find({}).populate('userId');
//         console.log('orders in load order page',orders);
//         const orderId = orders[0]._id; 
//         console.log(orderId,'order Id in load order page');
//         const order = await Order.findById(orderId);
//         console.log(order,'order in loadorder page');

//         if (!order) {
//             console.log('Order not found');
//             res.render('orders', { order: [] })
//             return;
//         }

//         const addressId = order.orderUserDetails
//         console.log(addressId,'addressId in load order page');
//         const address = await Address.findOne({ 'address._id': addressId })
//         console.log(address,'');
//         if (!address) {
//             console.log('Address not found');
//             res.render('orders', { order: [] }); 
//             return;
//         }

//         const matchedAddress = address.address.find(addr => addr._id.toString() === addressId.toString());

//         if (!matchedAddress) {
//             console.log('Address with the specified ID not found in the address array');
//             res.render('orders', { order: [] })
//             return;
//         }

//         console.log('Address found:', matchedAddress);
//         console.log(orders,'orders in admins side page');
//         res.render('orders', { order: orders, address: matchedAddress });
//     } catch (error) {
//         console.log(error.message);
//         res.render('orders', { order: [] })
//     }
// }


const loadOrderAdmin = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId').populate('orderUserDetails');
        // console.log(orders,'orders in load order amdin page');
       
        res.render('orders', { orders: orders });
    } catch (error) {
        console.log(error.message);
        res.render('orders', { orders: [] });
    }
}


const loadOrderEdit = async (req, res) =>{
    try {
        const orderId = req.params.orderId;
        console.log(orderId,'orderId in loadOrder Edit page');
        const order = await Order.findById(orderId).populate('userId');
        console.log(order,'order in loadOrderEdit page');
        const addressId = order.orderUserDetails;
        console.log(addressId,'addressId in loadorder Edit page');
        const address = await Address.findOne({ 'address._id': addressId });
        console.log(address,'address in load order Edit page');
        const matchedAddress = address.address.find(addr => addr._id.toString() === addressId.toString());
        console.log(matchedAddress,'matched address in load order Edit page');
        const products=[]
        let totalPrice=0;
        for(const item of order.products){
            const product=await Product.findById(item.productId);
            if(product){
                const firstImage=product.image[0]
                products.push({
                    name:product.name,
                    quantity:item.quantity,
                    price:product.price,
                    totalPrice:item.quantity*product.price,
                    firstImage: firstImage
                })
                totalPrice += item.quantity * product.price;
            }
        }
        console.log('Products.totalprice',products);
        res.render('orderEdit', { order: order, address: matchedAddress ,products:products ,totalPrice:totalPrice});
    } catch (error) {
        console.log(error.message);
        // Handle error
    }
}


const updateOrderStatus=async (req,res)=>{
    try {
        const {orderId}=req.params
        const {status}=req.body

        const updateOrder=await Order.findByIdAndUpdate(orderId,{status},{new:true})
        if(!updateOrder){
            return res.json({message:'order not found'})
        }
        res.json({message:'order status updated successfully',order:updateOrder})
    } catch (error) {
        console.error(error.message)
    }
}


const cancelOrder=async (req,res)=>{
    try {
        const orderId=req.params.orderId
        console.log('orderId in cancelorder page    ',orderId);
        const order = await Order.findById(orderId)
        console.log('order in cancel order  ::',order);
        order.status = 'Cancelled'
        await order.save()
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    productLoad,
    addProductLoad,
    insertProduct,
    EditProductLoad,
    editProduct,
    deleteProduct,
    updateProductStatus,
    loadOrderAdmin,
    loadOrderEdit,
    updateOrderStatus,
    cancelOrder
}