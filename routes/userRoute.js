const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const config = require('../config/config')
const auth = require('../middleware/auth')


const user_route = express()


user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))

user_route.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

user_route.use(flash())


user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')


const userController = require('../controllers/userController')


user_route.get('/signup', auth.isLogout, userController.loadSignup)
user_route.post('/signup', userController.insertUser)
user_route.get('/otp', auth.isLogout, userController.otpPage)
user_route.post('/otp', userController.verifyOTP)
user_route.get('/resendOTP', auth.isLogout, userController.resendOTP)
user_route.get('/signIn', auth.isLogout, userController.loadSignIn)
user_route.post('/signIn', userController.verifySignIn)
user_route.get('/', auth.isLoggedIn, userController.loadHome)
user_route.get('/home', auth.isLogin, auth.isLoggedIn,auth.isActive, userController.loadHome)
user_route.get('/logout', userController.logout)
user_route.get('/forgetPass', userController.forgetPass)
user_route.post('/forgetPass', userController.forgetUpdate)
user_route.get('/forgetOtp', userController.forgetOtpLoad)
user_route.get('/resendOtpPage', userController.resendOtpPage)
user_route.post('/forgetOtp', userController.forgetOtpUpdate)
user_route.get('/resetPassword', userController.newPassLoad)
user_route.post('/resetPassword', userController.newPassUpadate)
user_route.get('/shop', auth.isLoggedIn, userController.loadShop)
user_route.get('/products', userController.products)
user_route.get('/search', userController.searchProducts)
user_route.get('/singleProduct/:productId',auth.isLoggedIn, userController.loadSingleProduct)
user_route.get('/cart' ,auth.isLoggedIn,auth.isLogin,auth.isActive, userController.loadCart)
user_route.post('/addToCart', userController.addToCart)
user_route.post('/updateCartQuantity/:productId', userController.updateCartQuantity)
user_route.delete('/cart/remove/:productId', userController.removeFromCart)
user_route.get('/checkout',auth.isLoggedIn, auth.isLogin,auth.isActive, userController.loadCheckout)
user_route.post('/placeOrder',auth.isActive, userController.placeOrder)
user_route.post('/createOrder', userController.createOrder)
user_route.post('/api/payment/verify', userController.verifyRazorpay)
user_route.get('/couponGet', userController.couponGet)
user_route.post('/applyCoupon', userController.applyCoupon)
user_route.post('/addMoneyToWallet', userController.addMoneyToWallet)
user_route.post('/processWalletPayment', userController.processWalletPayment)
user_route.post('/processRefund', userController.processRefund)
user_route.get('/wishlist',auth.isLoggedIn, auth.isLogin,auth.isActive, userController.loadWishlist)
user_route.post('/addToWishlist', userController.addToWishlist)
user_route.delete('/wishlist/remove/:productId', userController.removeFromWishlist)
user_route.post('/changeProfile', userController.changeProfile)
user_route.get('/orderDetails/:id,:orderId', auth.isLogin, userController.loadOrderDetails)
user_route.get('/invoice/:orderId,:productId', userController.loadInvoice)
user_route.get('/contact', userController.loadContact)
user_route.get('/about', userController.loadAbout)
user_route.post('/orderDetails/repay/:id',userController.repayment)


module.exports = user_route