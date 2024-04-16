const express = require('express')
const category_route = express()
const session = require('express-session')
const flash = require('connect-flash')
const adminAuth = require('../middleware/adminAuth')

category_route.use(express.json())
category_route.use(express.urlencoded({ extended: true }))
category_route.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
category_route.use(flash())


category_route.set('view engine', 'ejs')
category_route.set('views', './views/admin')

const categoryController = require('../controllers/categoryController')

category_route.get('/category', adminAuth.isLogin, categoryController.categoryLoad)
category_route.post('/category', categoryController.addCategory)
category_route.post('/category/:id/edit', categoryController.editCategory)
category_route.get('/deleteCategory/:id', categoryController.deleteCato)
category_route.post('/category/:id/updateStatus', categoryController.updateCategoryStatus);


module.exports = category_route