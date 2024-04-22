const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Wishlist=require('../models/wishlistModel')
const Cart=require('../models/cartModel')
const Wallet = require('../models/walletModel')

//     address page rendering
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')
        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
        
        const userAddress = await Address.findOne({ userId });

        const orders = await Order.find({ userId }).populate('products.productId');
        const users = await User.findOne({ _id: userId })

        const wallets = await Wallet.find({ userId })
        let walletBalance = 0;
        if (wallets.length > 0) {
            walletBalance = wallets[0].balance;
        }
        let transactions = []
        if (wallets.length > 0) {
            transactions = wallets[0].transactions
        }

        res.render('dashboard', {isLoggedIn:res.locals.loggedIn,cart, userAddress, orders, users, walletBalance,wishlist, transactions, error: req.flash('error') });
    } catch (error) {
        console.log(error.message);
    }
}


//    add address 
const updateAddress = async (req, res) => {
    try {
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

        console.log(pincode, 'pincode in update Address');
        const existingAddress = await Address.findOne({ userId: req.session.user_id });

        if (existingAddress && existingAddress.address.length >= 3) {

            req.flash('error', 'You can add only three addresses.');
            return res.redirect('/dashboard');
        }
        if (existingAddress) {
            const update = {
                name: name,
                phone: phone,
                pincode: pincode,
                email: email,
                streetAddress: streetAddress,
                city: city,
                state: state,
                landmark: landmark,
                phone2: phone2
            }
            const ab = await Address.updateOne({ userId: req.session.user_id }, { $push: { address: update } });
        } else {

            const newAddress = new Address({
                userId: req.session.user_id,
                address: [{
                    name,
                    phone,
                    pincode,
                    email,
                    streetAddress,
                    city,
                    state,
                    landmark,
                    phone2
                }]
            });

            await newAddress.save();

        }
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Error adding address:', error);
    }
};


//    edit address
const editAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const addressId = req.params.addressId
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body
        const address = await Address.findOneAndUpdate({ userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.name': name,
                    'address.$.phone': phone,
                    'address.$.pincode': pincode,
                    'address.$.email': email,
                    'address.$.streetAddress': streetAddress,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.landmark': landmark,
                    'address.$.phone2': phone2
                }
            },
            { new: true }
        )
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}


//     delete address
const deleteAddress = async (req, res) => {
    try {

        const userId = req.session.user_id
        const addressId = req.params.addressId

        await Address.updateOne({ userId }, { $pull: { address: { _id: addressId } } })
        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
    }
}



//     check out address updating
const checkoutAddress= async (req,res)=>{
    try {
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

        console.log(pincode, 'pincode in update Address');
        const existingAddress = await Address.findOne({ userId: req.session.user_id });

        if (existingAddress && existingAddress.address.length >= 3) {

            req.flash('error', 'You can add only three addresses.');
            return res.redirect('/checkout');
        }
        if (existingAddress) {
            const update = {
                name: name,
                phone: phone,
                pincode: pincode,
                email: email,
                streetAddress: streetAddress,
                city: city,
                state: state,
                landmark: landmark,
                phone2: phone2
            }
            const ab = await Address.updateOne({ userId: req.session.user_id }, { $push: { address: update } });
        } else {

            const newAddress = new Address({
                userId: req.session.user_id,
                address: [{
                    name,
                    phone,
                    pincode,
                    email,
                    streetAddress,
                    city,
                    state,
                    landmark,
                    phone2
                }]
            });

            await newAddress.save();

        }
        return res.redirect('/checkout');
    } catch (error) {
        console.error('Error adding address:', error);
    }
}


module.exports = {
    updateAddress,
    editAddress,
    getDashboard,
    deleteAddress,
    checkoutAddress
}