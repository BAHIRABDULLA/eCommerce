const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Category = require('../models/categoryModel')


//     product page rendering 
const productLoad = async (req, res) => {
    try {

        const products = await Product.find().populate('category')
        res.render('products', { products, error: req.flash('error') })
    } catch (error) {
        console.log(error.message);
    }
}

//     add product page rendering
const addProductLoad = async (req, res) => {
    try {
        const products = await Product.find()
        const categories = await Category.find({ status: true })
        res.render('productAdd', { products, categories })
    } catch (error) {
        console.error('Error found in add product load',error);
    }
}


//     insert product to database
const insertProduct = async (req, res) => {
    try {

        const { name, category, quantity, brand, size, price, description } = req.body
        const existingProduct = await Product.findOne({ name: { $regex: `${name}`, $options: 'i' } })

        if (existingProduct) {
            req.flash('error', 'A product with the same name already exists')
            return res.redirect("/admin/products")
        }
        const imagePath = req.files.map(file => file.filename)


        const product = new Product({
            name,
            category,
            brand,
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


//     edit product page rendering 
const EditProductLoad = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId);
        const categories = await Category.find({ status: true })

        res.render('productEdit', { categories, product, error: req.flash('error') })
    } catch (error) {
        console.log(error.message);
    }
}


//     edit product working
const editProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { name, category, price, quantity, brand, size, description } = req.body;
        const updateImages = req.files.map(file => file.filename);
        const existingProductName = await Product.findOne({ name: { $regex: `${name}`, $options: 'i' }, _id: { $ne: productId } })
        if (existingProductName) {
            req.flash('error', 'Product already exist')
            res.redirect('/admin/products')
        } else {
            const product = await Product.findById(productId);
            product.name = name;
            product.category = category;
            product.brand = brand;
            product.price = price;
            product.quantity = quantity;
            product.size = size;
            product.description = description;
            if (updateImages.length > 0) {
                product.image = updateImages;
            }
            await product.save();
            res.redirect('/admin/products');
        }

    } catch (error) {
        console.log('Error updating product:', error.message);
        res.status(500).send('Internal Server Error');
    }
};


//     delete product working
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        await Product.findByIdAndDelete({ _id: productId })
        res.redirect('/admin/products')
    } catch (error) {

        console.error('Error founded in delete product',error);
    }
}


//     product status changing activity 
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


//    order page renddering
const loadOrderAdmin = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId').populate('orderUserDetails');
        res.render('orders', { orders: orders });
    } catch (error) {
        console.log(error.message);
        res.render('orders', { orders: [] });
    }
}


//    order details page rendering 
const loadOrderEdit = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('userId');
        const address = order.orderUserDetails;

        let originalPrice = await Order.findById(orderId).populate('products.productId')
        let original = []
        for (const item of order.products) {
            const product = await Product.findById(item.productId);
            original.push({
                originalPrice: product.price
            })
            console.log(originalPrice, 'original price for product:', product._id);
        }
        const products = []


        let totalPrice = 0;
        for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                const firstImage = product.image[0]
                products.push({
                    name: product.name,
                    quantity: item.quantity,
                    price: item.price,
                    originalPrice: product.price,
                    totalPrice: item.quantity * item.price,
                    firstImage: firstImage
                })
                totalPrice += item.quantity * product.price;
            }
        }
        res.render('orderEdit', { order: order, address, products: products, totalPrice: totalPrice, original });
    } catch (error) {
        console.log(error.message);
    }
}


//     order status changing 
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body

        let updateOrder
        let invoiceCode

        if (status === 'Delivered') {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const randomLetters = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]
            const randomDigits = ('0000' + Math.floor(Math.random() * 1000)).slice(-4)
            invoiceCode = randomLetters + randomDigits
            updateOrder = await Order.findByIdAndUpdate(orderId, { status, invoiceCode }, { new: true })
        } else {
            updateOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
        }

        if (!updateOrder) {
            return res.json({ message: 'order not found' })
        }
        res.json({ message: 'order status updated successfully', order: updateOrder })
    } catch (error) {
        console.error(error.message)
    }
}


//     order cancelling
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const order = await Order.findById(orderId)
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