const express = require('express')
const session = require('express-session')
const order_route = express()

order_route.use(express.json())
order_route.use(express.urlencoded({ extended: true }))

order_route.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

order_route.set('view engine', 'ejs')
order_route.set('views', './views/users')

const orderController = require('../controllers/orderController')

//       this is user side 
order_route.post('/userOrderCancel/:orderId', orderController.userOrderCancel)
order_route.post('/returnOrder/:orderId', orderController.userReturnOrder)


module.exports = order_route

