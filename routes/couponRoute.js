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
coupon_route.delete('/deleteCoupon/:couponId',couponController.deleteCoupon)
coupon_route.get('/couponEdit/:couponId',couponController.couponEdit)
coupon_route.post('/coupon-edit/:couponId',couponController.couponEditPost)
module.exports=coupon_route