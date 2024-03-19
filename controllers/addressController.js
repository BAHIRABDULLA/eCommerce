const Address=require('../models/addressModel')
const Order=require('../models/orderModel')
const User=require('../models/userModel')
const Wallet=require('../models/walletModel')


const getDashboard = async (req, res) => {
    try {
        // console.log('haaiiii');
        // console.log(req.session.user_id, 'user id in get address');
        const userId = req.session.user_id;
        console.log(userId,'userId in getdashbaord page');
        // console.log('UserId in dashboard',userId);
        const userAddress = await Address.findOne({ userId });


        const orders = await Order.find({ userId }).populate('products.productId');
    //    console.log(orders[0].products[0].productId.image[0])
        const users=await User.findOne({_id:userId})
        // console.log(users,'users in dashboard');

        const wallets= await Wallet.find({userId})
        let walletBalance = 0;
        if (wallets.length > 0) {
            walletBalance = wallets[0].balance;
        }

        console.log(wallets,'wallet in get dashbaord page');
        console.log(walletBalance, 'wallet balance in getdashboard page');
        res.render('dashboard', { userAddress,orders ,users,walletBalance});
    } catch (error) {
        console.log(error.message);
    }
}

// const updateAddress=async(req,res)=>{
//     try {
//         console.log(req.session.user_id,'this is user_id in update address');
//         // console.log(req.session.userId,'this userId in update Address');

//         const {name,phone,pincode,email,streetAddress,city,state,landmark,phone2}=req.body
//         const newAddress=new Address({
//             userId:req.session.user_id,
//             address:{
//                 name,
//                 phone,
//                 pincode,
//                 email,
//                 streetAddress,
//                 city,
//                 state,
//                 landmark,
//                 phone2
//             }
//         })
//         const update=await newAddress.save()
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const updateAddress = async (req, res) => {
    try {
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

        console.log(pincode,'pincode in update Address');
        const existingAddress = await Address.findOne({ userId: req.session.user_id });
        
        if (existingAddress && existingAddress.address.length >= 3) {
            // Show an error message
            req.flash('error', 'You can add only three addresses.');
            return res.redirect('/dashboard');
        }

        if (existingAddress) {
            existingAddress.address.push({
                name,
                phone,
                pincode,
                email,
                streetAddress,
                city,
                state,
                landmark,
                phone2
            });

            await existingAddress.save();
            // res.status(201).json({ message: 'Address added successfully', address: existingAddress });
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
        // res.status(500).json({ message: 'Internal Server Error' });
    }
};


const editAddress=async (req,res)=>{
    try {
        const userId=req.session.user_id
        const addressId=req.params.addressId
        const{name,phone,pincode,email,streetAddress,city,state,landmark,phone2}=req.body
        const address=await Address.findOneAndUpdate({userId,'address._id':addressId},
        {$set:{
            'address.$.name':name,
            'address.$.phone': phone,
            'address.$.pincode': pincode,
            'address.$.email': email,
            'address.$.streetAddress': streetAddress,
            'address.$.city': city,
            'address.$.state': state,
            'address.$.landmark': landmark,
            'address.$.phone2': phone2
        }},
        {new:true}
        )
        res.redirect('/dashboard')
        // res.json({status:true,address})
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress=async(req,res)=>{
    try {
        console.log('reached deelte address');
        const userId=req.session.user_id 
        const addressId=req.params.addressId
        console.log(addressId,'address Id in delete address');
        await Address.updateOne({userId},{$pull:{address:{_id:addressId}}})
        res.json({status:true})
        // res.redirect('/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    updateAddress,
    editAddress,
    getDashboard,
    deleteAddress

}