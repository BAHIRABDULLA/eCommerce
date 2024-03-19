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
        
        console.log(couponCode,'couponcode ');
        console.log(expireDate,'expiredate');
        console.log(description,'description in coupon add');
        const newCoupon=new Coupon({
            name:couponName,
            code:couponCode,
            description,
            discountAmount:discount,
            expireDate

            
        })
        const savedCoupon = await newCoupon.save()
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon=async(req,res)=>{
    try {
        const {couponId}=req.params
        console.log(couponId,'coupon id in deletecoupon');
        await Coupon.findByIdAndDelete(couponId)
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

const couponEdit=async(req,res)=>{
    try {
        const {couponId}=req.params
        console.log(couponId,'coupon id in coupon edit page');
        const coupon=await Coupon.findById(couponId)
        res.render("couponEdit",{coupon})
    } catch (error) {
        console.log(error.message);
    }
}

const couponEditPost=async(req,res)=>{
    try {
        const {couponId}=req.params
        const { couponName, couponCode, description, discount, expireDate } = req.body;
        console.log(couponId,'coupon id in coupond edit post');
        const editCoupon=await Coupon.findByIdAndUpdate(couponId,{
            name:couponName,
            code:couponCode,
            description,
            discountAmount:discount,
            expireDate
        },{new:true})
        res.redirect('/admin/coupon')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadCoupon,
    loadCouponAdd,
    couponAdding,
    deleteCoupon,
    couponEdit,
    couponEditPost
}