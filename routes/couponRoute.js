const express=require('express')
const coupon_route=express()

const adminAuth=require('../middleware/adminAuth')

coupon_route.use(express.json())
coupon_route.use(express.urlencoded({extended:true}))


coupon_route.set('view engine','ejs')
coupon_route.set('views','./views/admin')

const couponController=require('../controllers/couponController')
coupon_route.get('/coupon',adminAuth.isLogin,couponController.loadCoupon)

coupon_route.get('/couponAdd',adminAuth.isLogin,couponController.loadCouponAdd)
coupon_route.post('/coupon-add',couponController.couponAdding)
module.exports=coupon_route