const express = require('express')
const category_route = express()
const session = require('express-session')
const flash = require('connect-flash')
const adminAuth = require('../middleware/adminAuth')

category_route.use(express.json())
category_route.use(express.urlencoded({ extended: true }))
// category_route.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
category_route.use(flash())


category_route.set('view engine', 'ejs')
category_route.set('views', './views/admin')

const categoryController = require('../controllers/categoryController')

category_route.get('/deleteCategory/:id', categoryController.deleteCato)
category_route.post('/:id/edit', categoryController.editCategory)
category_route.post('/:id/updateStatus', categoryController.updateCategoryStatus);
category_route.get('/', adminAuth.isLogin, categoryController.categoryLoad)
category_route.post('/', categoryController.addCategory)


module.exports = category_route