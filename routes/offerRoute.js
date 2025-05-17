const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const offer_route = express()


// offer_route.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

offer_route.use(flash())


offer_route.set('view engine', 'ejs')
offer_route.set('views', './views/admin')


const offerController = require('../controllers/offerController')
const adminAuth = require('../middleware/adminAuth')

offer_route.get('/product', offerController.productOffer)
offer_route.get('/categories', offerController.categoriesOffer)
offer_route.get('/add', adminAuth.isLogin, offerController.offerAddLoad)
offer_route.post('/add', offerController.offerAdding)
offer_route.delete('/delete/:offerId', offerController.deleteOffer)
offer_route.get('/edit/:offerId', adminAuth.isLogin, offerController.loadOfferEdit)
offer_route.post('/editPost/:id', offerController.offerEditPost)
offer_route.get('/', adminAuth.isLogin, offerController.loadOffer)


module.exports = offer_route
