const express = require('express')
const session = require('express-session')
const config = require('../config/config')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const ExcelJS = require('exceljs')

const admin_route = express()

const adminAuth = require('../middleware/adminAuth')
admin_route.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

admin_route.use(express.json())
admin_route.use(express.urlencoded({ extended: true }))


admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')

const adminController = require('../controllers/adminController')
const doc = require('pdfkit')

admin_route.get('/', adminAuth.isLogout, adminController.adminLogin)
admin_route.post('/verify', adminController.adminVerify)

admin_route.get('/dashboard', adminAuth.isLogin, adminController.dashboardLoad)

admin_route.get('/dashboard/graph/value', adminController.graph)

admin_route.get('/dashboard/salesReport', adminAuth.isLogin, adminController.loadSalesReport)
admin_route.post('/dashboard/sales-report', adminController.showReport)
admin_route.get('/customer', adminAuth.isLogin, adminController.customerLoad)

admin_route.post('/user/:id/updateStatus', adminController.updateUserStatus);

admin_route.get('/deleteCustomer/:id', adminController.deleteUser)

admin_route.get('/logout', adminController.logout)
// admin_route.get('/category',adminController.categoryLoad)



module.exports = admin_route