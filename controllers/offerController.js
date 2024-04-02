const Offer=require('../models/offerModel')
const Category=require('../models/categoryModel')
const Product=require('../models/productModel')


const loadOffer=async(req,res)=>{
    try {
    
        const offers=await Offer.find()
        res.render('offer',{offers,error:req.flash('error')})
console.log('offer load is working ');

    } catch (error) {
        console.log(error.message);
    }
}


const offerAddLoad=async(req,res)=>{
    try {
        const products = await Product.find({});
        const categories = await Category.find({});
        // console.log(categories,'categories in offerAddLoad');
        // console.log(products,'products in offerAddload');
        res.render('offerAdd',{products,categories})
    } catch (error) {
        console.log(error.message);
    }
}

const categoriesOffer=async (req,res)=>{
    try {
        const categories = await Category.find({});
        res.json({categories});
    } catch (error) {
        console.log(error.message);
    }
}

const productOffer=async (req,res)=>{
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log(error.message);
    }
}

const offerAdding=async(req,res)=>{
    try {
        const {offerTitle,offerPercentage,description,startDate,expireDate,selectedItems}=req.body

        console.log(offerPercentage,'offer percenteage');
        console.log(startDate,'start date in offer adidng ');
        console.log(expireDate,'expire date in offer adding ');
        console.log(selectedItems,'selected items in controlelr')
        
        const existOfferName=await Offer.findOne({title:{$regex:`${offerTitle}`,$options:'i'}})
        if(existOfferName){
            req.flash('error','This title already existed')
            res.redirect('/admin/offer')
        }else{
            for (const itemId of selectedItems) {
                let offerApplied = 0;
    
                const product = await Product.findById(itemId);
                if (product) {
                    offerApplied = offerPercentage;
                    product.offerApplied = offerApplied;
                    await product.save();
                } else {
                    const category = await Category.findById(itemId);
                    if (category) {
                        offerApplied = offerPercentage;
                        category.offerApplied = offerApplied;
                        await category.save();
                    }
                }
            }
    
            const newOffer=new Offer({
                title:offerTitle,
                discountPercentage:offerPercentage,
                description,
                startDate,
                expireDate,
                selectedItems
                
            })
            await newOffer.save()
            // res.redirect('/admin/offer')
            res.status(200).json({ message: 'Offer created successfully' });
        }

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

// const getCategoriesAndProducts=async (req,res)=>{
//     try {
//         const categories=await Category.find()
//         const products=await Product.find()
//         res.json({categories,products})
//     } catch (error) {
//         console.log(error.message);
//     }
// }

module.exports={
    loadOffer,
    offerAddLoad,
    offerAdding,
    deleteOffer,
    loadOfferEdit,
    offerEditPost,
    // getCategoriesAndProducts,
    productOffer,
    categoriesOffer
}