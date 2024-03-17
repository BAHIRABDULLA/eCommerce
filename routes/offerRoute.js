const express=require('express')
const offer_route=express()

const adminAuth=require('../middleware/adminAuth')

offer_route.set('view engine','ejs')
offer_route.set('views','./views/admin')


const offerController=require('../controllers/offerController')

offer_route.get('/offer',adminAuth.isLogin,offerController.loadOffer)
offer_route.get('/offerAdd',adminAuth.isLogin,offerController.offerAddLoad)
offer_route.post('/offer-add',offerController.offerAdding)
offer_route.delete('/deleteOffer/:offerId',offerController.deleteOffer)
offer_route.get('/offerEdit/:offerId',offerController.loadOfferEdit)
offer_route.post('/offerEditPost/:id',offerController.offerEditPost)

module.exports=offer_route
