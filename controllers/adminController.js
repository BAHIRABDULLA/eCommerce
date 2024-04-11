// const Admin=require('../models/adminModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
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
        res.render('login', { error: req.flash('error') })
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
            req.flash('error', 'Email or Password is incorrect , please try again')
            res.redirect('/admin')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const top10ProductsCategories = async (req, res) => {
    try {
        const top10Products = await Order.aggregate([
            {
                $match: {
                    'status': 'Delivered'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    'from': 'products',
                    'localField': 'products.productId',
                    'foreignField': '_id',
                    'as': 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $group: {
                    '_id': '$productDetails._id',
                    'name': { '$first': '$productDetails.name' },
                    'image': { '$first': '$productDetails.image' },
                    'count': { '$sum': '$products.quantity' }
                }
            },
            {
                $sort: { 'count': -1 }
            },
            {
                $limit: 10
            }
        ]);

        const top10Categories = await Order.aggregate([
            {
                $match: {
                    'status': 'Delivered'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    'from': 'products',
                    'localField': 'products.productId',
                    'foreignField': '_id',
                    'as': 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $group: {
                    '_id': '$productDetails.category',

                    'count': { '$sum': 1 }
                }
            },
            {
                $lookup: {
                    'from': 'categories',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'categoryDetails'
                }
            },
            {
                $unwind: '$categoryDetails'
            },
            {
                $project: {
                    _id: 0,
                    categoryName: '$categoryDetails.name',
                    count: 1
                }
            },
            {
                $sort: { 'count': -1 }
            },
            {
                $limit: 10
            }
        ]);
        console.log(top10Products, 'top10 products ');
        console.log(top10Categories, 'top 10 categories ');


        return { top10Products, top10Categories }

    } catch (error) {
        console.error('Error founded in top10Products and categories', error);
    }
}

const dashboardLoad = async (req, res) => {
    try {

        const { top10Products, top10Categories } = await top10ProductsCategories(req, res)

        const order = await Order.find()
        let revenue = order.reduce((total, order) => total + order.totalAmount, 0);
        let salesCount = order.length
        let currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)
        let nextDay = new Date(currentDate)
        nextDay.setDate(currentDate.getDate() + 1)
        let dailyOrder = await Order.find({
            orderDate: {
                $gte: currentDate,
                $lte: nextDay
            }
        })
        let dailyRevenue = dailyOrder.reduce((total, order) => total + order.totalAmount, 0)
        res.render('dashboard', { order, revenue, salesCount, dailyRevenue, top10Products, top10Categories })
    } catch (error) {
        console.log(error.message);
    }
}




// const graph=async (req,res)=>{
//     try {

//         let {value}=req.query
//         console.log(value,'value in graph');

//         let pipeline = [];
//         if (value === 'weekly') {
//             let oneMonthAgo=new Date()
//             oneMonthAgo.setMonth(oneMonthAgo.getMonth()-1)
//             pipeline = [

//             ];
//         } else if (value === 'monthly') {
//             const twelveMonthsAgo=new Date()
//             twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth()-12)

//             pipeline = [
//                 {
//                     $match:{
//                         orderDate:{$gte:twelveMonthsAgo}
//                     }
//                 },
//                 {
//                     $group:{
//                         _id:{
//                             $dateToString:{
//                                 format:'%Y-%m',
//                                 date:"$orderDate"
//                             }
//                         },
//                             monthlyTotalAmount:{
//                                 $sum:'$totalAmount'
//                             }

//                     }
//                 }
//             ];
//         } else if (value === 'yearly') {

//             const tenYearsAgo= new Date()
//             tenYearsAgo.setFullYear(tenYearsAgo.getFullYear()-10)

//             pipeline= [
//                 {
//                     $match:{
//                         orderDate:{$gte:tenYearsAgo}
//                     }
//                 },
//                 {
//                     $group:{
//                         _id:{$year:'$orderDate'},
//                         totalRevenue:{$sum:'$totalAmount'},
//                         orderCount:{$sum:1}
//                     }
//                 },
//                 {
//                     $project:{
//                         _id:0,
//                         year:'$_id',
//                         totalRevenue:1,
//                         orderCount:1
//                     }
//                 },
//                 {
//                     $sort:{
//                         year:1
//                     }
//                 }
//             ]
//         }

//         const data = await Order.aggregate(pipeline);
//         console.log(data, 'data in graph');

//         res.json(data);


//     } catch (error) {
//         console.error('Erroru founder in graph',error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }



const graph = async (req, res) => {
    try {
        let { value } = req.query;
        console.log(value, 'value in graph');

        let pipeline = [];

        if (value === 'monthly') {

            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            const endOfYear = new Date(new Date().getFullYear(), 11, 31);

            pipeline = [
                {
                    $match: {
                        orderDate: { $gte: startOfYear, $lte: endOfYear }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$orderDate' },
                        month: { $first: { $month: '$orderDate' } },
                        monthlyTotalAmount: { $sum: '$totalAmount' },
                        monthlyOrderCount: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ];
        } else if (value === 'yearly') {

            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 9);

            pipeline = [
                {
                    $match: {
                        orderDate: { $gte: tenYearsAgo }
                    }
                },
                {
                    $group: {
                        _id: { $year: '$orderDate' },
                        yearlyTotalAmount: { $sum: '$totalAmount' },
                        yearlyOrderCount: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        '_id': 1
                    }
                }
            ];
        }

        const data = await Order.aggregate(pipeline);


        console.log(data, 'data in graph');

        res.json(data);
    } catch (error) {
        console.error('Error found in graph', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const loadSalesReport = async (req, res) => {
    try {
        

        res.render('salesReport')
    } catch (error) {
        console.log(error.message);
    }
}


const showReport = async (req, res) => {
    try {
        console.log('its here in show report');
        const { reportType, startDate, endDate } = req.body;
        console.log(reportType, 'rT', startDate, 'sD', endDate, 'eD');
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
        console.log(orders, 'orders in sales report ');
        // const reportData = orders.map(order => ({
        //     date: order.orderDate ? order.orderDate.toISOString().split('T')[0] : 'N/A',
        //     salesCount: orders.length,
        //     revenue: orders.reduce((acc, curr) => acc + curr.totalAmount, 0),
        //     // coupon: order.couponApplied 
        // }));

        const reportData = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: '$orderDate' } },
                    salesCount: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }

                }
            },
            { $sort: { _id: 1 } }
        ])
        const formattedReportData = reportData.map(item => ({
            date: item._id,
            salesCount: item.salesCount,
            revenue: item.revenue
        }))
        orders.forEach(order => {
            console.log(order._id, order.orderDate, 'ordre.orderDate');
        })
        console.log(reportData, 'reportdatea====');
        console.log(formattedReportData, 'formattedReportData#####');
        res.json(formattedReportData);
    } catch (error) {
        console.error('Error founded in showReport', error);
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
        const userId = req.params.id
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



const logout = async (req, res) => {
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
    graph,
    loadSalesReport,
    showReport,
    customerLoad,
    deleteUser,
    updateUserStatus,
    logout
}