const Offer = require('../models/offerModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')


//     offer page rendering
const loadOffer = async (req, res) => {
    console.log('we are reaching to offer load')
    try {
        const offers = await Offer.find()
        console.log('offer load is working ');
        return res.render('offer', { offers, error: req.flash('error') })

    } catch (error) {
        console.log(error.message);
    }
}

//     offer add page rendering
const offerAddLoad = async (req, res) => {
    try {
        const products = await Product.find({});
        const categories = await Category.find({});
        res.render('offerAdd', { products, categories })
    } catch (error) {
        console.log(error.message);
    }
}


//    caterory and product pass from getting database
const categoriesOffer = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json({ categories });
    } catch (error) {
        console.log(error.message);
    }
}
const productOffer = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log(error.message);
    }
}


//    offer adding work
const offerAdding = async (req, res) => {
    try {
        const { offerTitle, offerPercentage, description, startDate, expireDate, selectedItems } = req.body

        const existOfferName = await Offer.findOne({ title: { $regex: `${offerTitle}`, $options: 'i' } })
        if (existOfferName) {
            req.flash('error', 'This title already existed')
            res.redirect('/admin/offer')
        } else {
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

            const newOffer = new Offer({
                title: offerTitle,
                discountPercentage: offerPercentage,
                description,
                startDate,
                expireDate,
                selectedItems

            })
            await newOffer.save()
            res.status(200).json({ message: 'Offer created successfully' });
        }
    } catch (error) {
        console.log(error.message);
    }
}


//    offer deleting
const deleteOffer = async (req, res) => {
    try {
        const { offerId } = req.params
        await Offer.findByIdAndDelete(offerId)
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}


//     offer edit page rendering 
const loadOfferEdit = async (req, res) => {
    try {
        const { offerId } = req.params
        const offer = await Offer.findById(offerId)
        res.render('offerEdit', { offer })
    } catch (error) {
        console.log(error.message);
    }
}


//     offer edit work 
const offerEditPost = async (req, res) => {
    try {
        const { id } = req.params
        const { offerTitle, offerPercentage, description, startDate, expireDate } = req.body

        console.log(id, 'id in offer edit post');
        const update = await Offer.findByIdAndUpdate(id, {
            title: offerTitle,
            discountPercentage: offerPercentage,
            description,
            startDate,
            expireDate
        }, { upsert: true })
        update.save()
        res.redirect('/admin/offer')

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadOffer,
    offerAddLoad,
    offerAdding,
    deleteOffer,
    loadOfferEdit,
    offerEditPost,
    productOffer,
    categoriesOffer
}