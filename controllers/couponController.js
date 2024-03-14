const Coupon=require('../models/couponModel');
const { find } = require('../models/userModel');



const loadCoupon=async(req,res)=>{
    try {
        const coupons=await Coupon.find({})
        res.render('coupon',{coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const loadCouponAdd=async(req,res)=>{
    try {
        res.render('couponAdd')
    } catch (error) {
        console.log(error.message);
    }
}

const couponAdding=async(req,res)=>{
    try {
        const {couponName,couponCode,description,discount,expireDate}=req.body
        const active=req.body.hasOwnProperty('active')
        console.log(couponCode,'couponcode ');
        console.log(expireDate,'expiredate');
        console.log(active,'active in coupon adding ');
        const newCoupon=new Coupon({
            name:couponName,
            code:couponCode,
            description,
            discountAmount:discount,
            expireDate,
            active

        })
        const savedCoupon = await newCoupon.save()
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    loadCoupon,
    loadCouponAdd,
    couponAdding
}