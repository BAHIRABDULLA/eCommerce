const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const auth = require('../middleware/auth')
const address_route = express()

address_route.use(express.json())
address_route.use(express.urlencoded({ extended: true }))

// address_route.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

address_route.use(flash())

address_route.set('view engine', 'ejs')
address_route.set('views', './views/users')

const addressController = require('../controllers/addressController')

address_route.get('/dashboard',auth.isLoggedIn, auth.isLogin,auth.isActive, addressController.getDashboard)
address_route.post('/address', addressController.updateAddress)
address_route.post('/editAddress/:addressId', addressController.editAddress)
address_route.delete('/address/:addressId', addressController.deleteAddress)
address_route.post('/checkoutAddress',addressController.checkoutAddress)

module.exports = address_route