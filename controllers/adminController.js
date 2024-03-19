// const Admin=require('../models/adminModel')
const User = require('../models/userModel')
const Order= require('../models/orderModel')
const Coupon=require('../models/couponModel')
// const Category=require('../models/categoryModel')
const bcrypt = require('bcrypt')
require('dotenv').config()


console.log(process.env.adminEmail);
// console.log(adminName);


const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10)

    } catch (error) {
        console.log(error.message);
    }
}

console.log('hello');
const adminLogin = async (req, res) => {
    try {
        console.log('is there any mistake');
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
console.log('adminverify open');
const adminVerify = async (req, res) => {
    try {

        console.log('adminverify');
        const email = process.env.adminEmail
        console.log(email);
        const password = process.env.adminPassword
        console.log(password);
        const name = process.env.adminName
        console.log(name);
        if (req.body.email === email && req.body.password === password) {
            req.session.dd = { email, password }
            res.redirect('/admin/dashboard')
        } else {
            res.redirect('/admin')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const dashboardLoad = async (req, res) => {
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error.message);
    }
}


const loadSalesReport=async (req,res)=>{
    try {
        const order=await Order.find()

        res.render('salesReport')
    } catch (error) {
        console.log(error.message);
    }
}
const showReport=async(req,res)=>{
    try {
        console.log('its here in show report');
        const { reportType, startDate, endDate } = req.body;
        console.log(reportType,'report tyep',startDate,'startdate',endDate,'enddate');
        let query = {};

        // Modify query based on reportType and date range
        if (reportType === 'daily') {
            query = { createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } };
        } else if (reportType === 'weekly') {
            // Logic for weekly report
        } else if (reportType === 'monthly') {
            // Logic for monthly report
        } else if (reportType === 'yearly') {
            // Logic for yearly report
        } else if (reportType === 'custom') {
            // Logic for custom date range
        }

        const orders = await Order.find(query);

 
        const totalSalesCount = orders.length;
        console.log(totalSalesCount,'totalsalescount');
        const totalOrderAmount = orders.reduce((acc, order) => acc + order.amount, 0);
        console.log(totalOrderAmount,'totalOrder amount ')
        const totalDiscountAmount = orders.reduce((acc, order) => acc + order.discount, 0);
        console.log(totalDiscountAmount,'totalDiscount amount')
        const totalCoupon = orders.reduce((acc, order) => acc + order.couponCount, 0);
        console.log(totalCoupon,'totalcoupon');

        res.json({
            orders,
            totalSalesCount,
            totalOrderAmount,
            totalDiscountAmount,
            totalCoupon
        });
    } catch (error) {
        console.error('Error founded in showReport',error);
    }
}

const customerLoad = async (req, res) => {
    try {
        console.log('wait customer load');
        const users = await User.find()
        console.log('customer load is working ');
        res.render('customer', { users })

    } catch (error) {

        console.log(error.message);
    }
}


const deleteUser = async (req, res) => {
    try {
        let userId = req.params.id
        await User.findByIdAndDelete(userId)
        console.log(userId);
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error.message);
    }
}

const updateUserStatus = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.is_active = !user.is_active;

        if (user.is_active) {
            res.send({ status: true });
        } else {
            res.send({ status: false });
        }

        await user.save();

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send('Internal Server Error');
    }
};



const logout=async (req,res)=>{
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('error destroying sessions', err)
            }
            res.redirect('/admin')
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    adminLogin,
    adminVerify,
    dashboardLoad,
    loadSalesReport,
    showReport,
    customerLoad,
    deleteUser,
    updateUserStatus,
    logout
}