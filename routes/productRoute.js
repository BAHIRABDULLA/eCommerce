const express = require('express')
const product_route = express()
const path = require('path')
const flash = require('connect-flash')
const fs = require('fs')
const session = require('express-session')


product_route.use(flash())

// product_route.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

product_route.set('view engine', 'ejs')
product_route.set('views', './views/admin')
const productController = require('../controllers/productController')
const adminAuth = require('../middleware/adminAuth')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})
const upload = multer({ storage: storage })

product_route.get('/products', adminAuth.isLogin, productController.productLoad)
product_route.get('/product/add', adminAuth.isLogin, productController.addProductLoad)
product_route.post('/product/add', upload.array('image'), productController.insertProduct)
product_route.get('/product/edit/:productId', adminAuth.isLogin, productController.EditProductLoad)
product_route.post('/product/edit/:productId', upload.array('img[]'), productController.editProduct)
product_route.get('/product/delete/:id', productController.deleteProduct)
product_route.post('/product/:id/updateStatus', productController.updateProductStatus)


///admin order side
product_route.get('/orders', adminAuth.isLogin, productController.loadOrderAdmin)
product_route.get('/orderEdit/:orderId', adminAuth.isLogin, productController.loadOrderEdit)
product_route.post('/updateOrderStatus/:orderId', productController.updateOrderStatus)
product_route.post('/cancel-order/:orderId', productController.cancelOrder)    //this is adminside


module.exports = product_route