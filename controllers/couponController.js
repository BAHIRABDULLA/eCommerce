const Coupon = require('../models/couponModel');

//     coupon page rendering
const loadCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
        res.render('coupon', { coupons, error: req.flash('error') })
    } catch (error) {
        console.log(error.message);
    }
}


//    coupon add page rendering 
const loadCouponAdd = async (req, res) => {
    try {
        res.render('couponAdd', { error: req.flash('error') })
    } catch (error) {
        console.log(error.message);
    }
}


//    coupon adding from coupon add page
const couponAdding = async (req, res) => {
    try {
        const { couponName, couponCode, description, discount, expireDate } = req.body
        const existCouponName = await Coupon.findOne({ name: { $regex: `${couponName}`, $options: 'i' } })
        if (existCouponName) {
            req.flash('error', 'This coupon already existed')
            return res.redirect('/admin/coupon')
        } else {
            const newCoupon = new Coupon({
                name: couponName,
                code: couponCode,
                description,
                discountAmount: discount,
                expireDate
            })
            await newCoupon.save()
            res.redirect('/admin/coupon')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//    coupon deleting
const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params
        await Coupon.findByIdAndDelete(couponId)
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}


//    coupon edit page rendering
const couponEdit = async (req, res) => {
    try {
        const { couponId } = req.params
        const coupon = await Coupon.findById(couponId)
        res.render("couponEdit", { coupon })
    } catch (error) {
        console.log(error.message);
    }
}


//   coupon edit working 
const couponEditPost = async (req, res) => {
    try {
        const { couponId } = req.params
        const { couponName, couponCode, description, discount, expireDate } = req.body;
        const existCouponName = await Coupon.findOne({ name: { $regex: `${couponName}`, $options: 'i' }, _id: { $ne: couponId } })
        if (existCouponName) {
            req.flash('error', 'This coupon already existed')
            return res.redirect('/admin/coupon')
        } else {
            const editCoupon = await Coupon.findByIdAndUpdate(couponId, {
                name: couponName,
                code: couponCode,
                description,
                discountAmount: discount,
                expireDate
            }, { new: true })
            res.redirect('/admin/coupon')
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadCoupon,
    loadCouponAdd,
    couponAdding,
    deleteCoupon,
    couponEdit,
    couponEditPost
}