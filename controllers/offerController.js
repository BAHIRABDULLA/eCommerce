const Offer=require('../models/offerModel')


const loadOffer=async(req,res)=>{
    try {
    
        const offers=await Offer.find()
        res.render('offer',{offers})
console.log('offer load is working ');

    } catch (error) {
        console.log(error.message);
    }
}


const offerAddLoad=async(req,res)=>{
    try {
        res.render('offerAdd')
    } catch (error) {
        console.log(error.message);
    }
}


const offerAdding=async(req,res)=>{
    try {
        const {offerTitle,offerPercentage,description,startDate,expireDate}=req.body

        console.log(offerPercentage,'offer percenteage');
        console.log(startDate,'start date in offer adidng ');
        console.log(expireDate,'expire date in offer adding ');

        const newOffer=new Offer({
            title:offerTitle,
            discountPercentage:offerPercentage,
            description,
            startDate,
            expireDate
        })
        await newOffer.save()
        res.redirect('/admin/offer')

    } catch (error) {
        console.log(error.message);
    }
}



const deleteOffer=async(req,res)=>{
    try {
        const {offerId}=req.params
        console.log(offerId,'offer id in dele offer ');
        await Offer.findByIdAndDelete(offerId)
        console.log('its deleted   gggooooo ');
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

const loadOfferEdit=async(req,res)=>{
    try {
        const {offerId}=req.params
        console.log(offerId,'offerId in loadooffer edit page');
        const offer=await Offer.findById(offerId)
        console.log(offer,'offer in load offer Edit page');
        res.render('offerEdit',{offer})
    } catch (error) {
        console.log(error.message);
    }
}

const offerEditPost=async(req,res)=>{
    try {
        const{id}=req.params
        const {offerTitle,offerPercentage,description,startDate,expireDate}=req.body

        console.log(id,'id in offer edit post');
        const update=await Offer.findByIdAndUpdate(id,{
            title:offerTitle,
            discountPercentage:offerPercentage,
            description,
            startDate,
            expireDate
        },{upsert:true})
        update.save()
        res.redirect('/admin/offer')
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadOffer,
    offerAddLoad,
    offerAdding,
    deleteOffer,
    loadOfferEdit,
    offerEditPost
}