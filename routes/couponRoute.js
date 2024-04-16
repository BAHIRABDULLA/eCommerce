const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const coupon_route = express()

const adminAuth = require('../middleware/adminAuth')

coupon_route.use(express.json())
coupon_route.use(express.urlencoded({ extended: true }))

coupon_route.use(session({
    secret: 'newScret',
    resave: false,
    saveUninitialized: false
}))

coupon_route.set('view engine', 'ejs')
coupon_route.set('views', './views/admin')

const couponController = require('../controllers/couponController')
coupon_route.get('/coupon', adminAuth.isLogin, couponController.loadCoupon)
coupon_route.get('/couponAdd', adminAuth.isLogin, couponController.loadCouponAdd)
coupon_route.post('/couponAdd', couponController.couponAdding)
coupon_route.delete('/deleteCoupon/:couponId', couponController.deleteCoupon)
coupon_route.get('/couponEdit/:couponId', adminAuth.isLogin, couponController.couponEdit)
coupon_route.post('/coupon-edit/:couponId', couponController.couponEditPost)


module.exports = coupon_route