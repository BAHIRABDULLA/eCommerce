const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const coupon_route = express()

const adminAuth = require('../middleware/adminAuth')

coupon_route.use(express.json())
coupon_route.use(express.urlencoded({ extended: true }))

// coupon_route.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
coupon_route.use(flash())


coupon_route.set('view engine', 'ejs')
coupon_route.set('views', './views/admin')

const couponController = require('../controllers/couponController')
coupon_route.get('/add', adminAuth.isLogin, couponController.loadCouponAdd)
coupon_route.post('/add', couponController.couponAdding)
coupon_route.delete('/delete/:couponId', couponController.deleteCoupon)
coupon_route.get('/edit/:couponId', adminAuth.isLogin, couponController.couponEdit)
coupon_route.post('/edit/:couponId', couponController.couponEditPost)
coupon_route.get('/', adminAuth.isLogin, couponController.loadCoupon)


module.exports = coupon_route