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
       console.log(reportType,'rT',startDate,'sD',endDate,'eD');
        let query = {};

        
        switch (reportType) {
            case 'daily':
                query = {
                    orderDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
                };
                break;
            case 'weekly':
                query = {
                    orderDate: {
                        $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), 
                        $lt: new Date()
                    }
                };
                break;
            case 'monthly':
                query = {
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
                        $lt: new Date()
                    }
                };
                break;
            case 'yearly':
                query = {
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), 0, 1), 
                        $lt: new Date()
                    }
                };
                break;
            case 'custom':
                query = {
                    orderDate: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)
                    }
                };
                break;
            default:
                break;
        }
        const orders = await Order.find(query);
        console.log(orders,'orders in sales report ');
        // const reportData = orders.map(order => ({
        //     date: order.orderDate ? order.orderDate.toISOString().split('T')[0] : 'N/A',
        //     salesCount: orders.length,
        //     revenue: orders.reduce((acc, curr) => acc + curr.totalAmount, 0),
        //     // coupon: order.couponApplied 
        // }));

        const reportData=await Order.aggregate([
            {$match:query},
            {
                $group:{
                    _id:{$dateToString:{format:"%Y-%m-%d" ,date:'$orderDate'}},
                    salesCount:{$sum:1},
                    revenue:{$sum:'$totalAmount'}

                }
            },
            {$sort:{_id:1}}
        ])
        const formattedReportData=reportData.map(item=>({
            date:item._id,
            salesCount:item.salesCount,
            revenue:item.revenue
        }))
        orders.forEach(order=>{
            console.log(order._id,order.orderDate,'ordre.orderDate');
        })
        console.log(reportData,'reportdatea====');
        console.log(formattedReportData,'formattedReportData#####');
        res.json(formattedReportData);
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