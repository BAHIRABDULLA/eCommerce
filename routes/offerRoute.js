const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const offer_route = express()

const adminAuth = require('../middleware/adminAuth')

offer_route.use(session({
    secret: 'newScret',
    resave: false,
    saveUninitialized: false
}))

offer_route.set('view engine', 'ejs')
offer_route.set('views', './views/admin')


const offerController = require('../controllers/offerController')

offer_route.get('/offer', adminAuth.isLogin, offerController.loadOffer)
offer_route.get('/offerAdd', adminAuth.isLogin, offerController.offerAddLoad)
offer_route.get('/productOffer', offerController.productOffer)
offer_route.get('/categoriesOffer', offerController.categoriesOffer)
offer_route.post('/offer-add', offerController.offerAdding)
offer_route.delete('/deleteOffer/:offerId', offerController.deleteOffer)
offer_route.get('/offerEdit/:offerId', adminAuth.isLogin, offerController.loadOfferEdit)
offer_route.post('/offerEditPost/:id', offerController.offerEditPost)


module.exports = offer_route
