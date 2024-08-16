const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const Wishlist = require('../models/wishlistModel')
const Offer= require('../models/offerModel')
const bcryptjs = require('bcryptjs')
const nodemailer = require('nodemailer')
const { ObjectId } = require('mongodb');




//   this is otp generating 
function generate4DigitOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000)
    console.log(otp, 'first otp');
    return otp.toString()
}

//   this is for email sending 
const sendVerifyMail = async (name, email, otp) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTPEMAIL,
                pass: process.env.SMTPPASS
            }
        })
        const mailOptions = {
            from: 'bahirbusiness123@gmail.com',
            to: email,
            subject: 'For Verification Mail',
            html: `<p1>Haai   ${name},  please use this OTP:${otp} to your mail.</p>  `
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent', info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

// password secure 
const securePassword = async (password) => {
    try {
        return await bcryptjs.hash(password, 10)
    } catch (error) {
        console.log(error.message);
    }
}


//   this is for signUp page loading 
const loadSignup = async (req, res) => {
    try {
        req.session.referral = req.query.referral
        const errorMessage = req.flash('error')
        res.render('signUp', { errorMessage })
    } catch (error) {
        console.log(error.message);
    }
}


//   redirecting 
const redirectPage = (res, userData) => {
    // console.log(userData, "userdata reditrect");
    res.redirect(`/otp?userId=${userData._id}&email=${encodeURIComponent(userData.email)}`);
};


//  insert user in sign up page
const insertUser = async (req, res) => {
    try {

        const spassword = await securePassword(req.body.password)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: spassword
        })
        const userData = await user.save()
        if (userData) {
            const generateOTP = generate4DigitOTP()
            req.session.otp = { value: generateOTP, timestamp: Date.now() }
            sendVerifyMail(req.body.name, req.body.email, generateOTP)
            redirectPage(res, userData)
        } else {
            req.flash('error', 'User registration failed.Please try again ')
            res.render('signUp')
        }
    } catch (error) {
        console.log(error.message);
        req.flash('error', error.message)
        res.redirect('/signUp')
    }
}


//   this is for showing OTP page
const otpPage = async (req, res) => {
    try {

        const userId = req.query.userId
        const email = req.query.email
        console.log(email, 'this is otpPage email');
        if (!userId) {
            throw new Error('userId is missing ')
        }
        // console.log(userId, "this is otpPage passed id");
        req.session.email = email
        res.render('signupOtp', { userId: userId, email: email, message: '' })

    } catch (error) {
        console.error('Error founded in otp page', error);
    }
}


//   this is OTP verification in signUp side  
const verifyOTP = async (req, res) => {
    try {
        const enteredOTP = req.body.otp
        console.log(req.body.otp, 'its body otp');
        const {  userId } = req.body
        const userIdObj = new ObjectId(userId)
        const userData = await User.findById(userIdObj)
        if (!userData) {  
            // res.render('signupOTP', { userId: userId, message: 'User not found' })
            return res.json({error: 'User not found' })
        }
        const storeOtp = req.session.otp
        const date=new Date(storeOtp.timestamp)
        console.log(storeOtp,'storeOtp')
        const otpExpireTime = 30 * 1000
        const otpAge = Date.now() - storeOtp.timestamp
        if (!storeOtp || otpAge > otpExpireTime) {
            // return res.render('signupOtp', { userId: userId, email: req.session.email, message: 'OTP has expired,please use resend' })
            return res.json({ error: 'OTP_EXPIRED' });
        }
        const isOTPValid = enteredOTP === storeOtp.value
        console.log(storeOtp, 'its stored otp');
        console.log(isOTPValid,'isOtpValid');
        if (isOTPValid) {
            userData.is_verified = 1
            await userData.save()
            req.session.user_id = userData._id
            await req.session.save();
            if (req.session.referral) {
                let wallet = await Wallet.findOne({ userId: req.session.referral })
                if (!wallet) {
                    wallet = new Wallet({
                        userId: req.session.referral,
                        balance: 1000,
                        transactions: [{
                            type: 'credit',
                            reason: 'referral',
                            date: Date.now(),
                            transactionAmount: 1000
                        }]
                    })
                } else {
                    wallet.balance += 1000
                    wallet.transactions.push({
                        type: 'credit',
                        reason: 'referral',
                        date: new Date(),
                        transactionAmount: 1000
                    })
                }
                await wallet.save()
            }
            return res.json({ success: true });
        } else {
            // req.flash('error', 'Invalid OTP')
            // res.render('signupOtp', { userId: userId, email: req.query.email, message: req.flash('error') })
            return res.json({ error: 'INVALID_OTP' });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//   this is  for sign In page showing 
const loadSignIn = async (req, res) => {
    try {
        res.render('signIn', { error: req.flash('error') })
    } catch (error) {
        console.error('Error founded in load sign in ',error);
    }
}


//   this is verify signIn page
const verifySignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email, password, 'its req.body email and password in verify sign in ');

        const user = await User.findOne({ email })
        if (!user) {
            return res.render('signIn', { error: 'invalid email or password' })
        }
        const passwordMatch = await bcryptjs.compare(password, user.password)
        if (!passwordMatch) {
            req.flash('error', 'Invalid email or password,please ty again ')

            return res.render('signIn', { error: req.flash('error') })
        }
        if (user.is_verified === 0 || user.is_active === false) {
            req.flash('error', 'User registration failed.Please try again ')

            res.render('signIn',{error:req.flash('error')})
        } else {
            req.session.user_id = user._id;
            await req.session.save();
            console.log(req.session, 'this is req.session details');
            res.redirect('/home')
        }


    } catch (error) {
        console.log(error.message);
    }
}


//   this is for resend otp 
const resendOTP = async (req, res) => {
    try {
        const { userId, email } = req.query
        if (!email) {
            throw new Error('reciepient email is missing ')
        }
        const generateOTP = generate4DigitOTP()
        req.session.otp = { value: generateOTP, timestamp: Date.now() }
        console.log(req.session.otp, 'this is resendOTP session otp');
        sendVerifyMail(req.body.name, email, generateOTP)
        res.redirect(`/otp?userId=${userId}&email=${encodeURIComponent(email)}`)
    } catch (error) {
        console.log(error.message);
    }
}


//   this is for loading home page
const loadHome = async (req, res) => {
    try {
        const product=await Product.find()
        const category=await Category.find()
        const top6Products = await Order.aggregate([
            {
                $match: {
                    'status': 'Delivered'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    'from': 'products',
                    'localField': 'products.productId',
                    'foreignField': '_id',
                    'as': 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $group: {
                    '_id': '$productDetails._id',
                    'price':{'$first':'$products.price'},
                    'name': { '$first': '$productDetails.name' },
                    'image': { '$first': '$productDetails.image' },
                    'count': { '$sum': '$products.quantity' }
                }
            },
            {
                $sort: { 'count': -1 }
            },
            {
                $limit: 6
            }
        ]);
        const offer = await Offer.findOne({"selectedItems": {"$elemMatch": {"$exists": true}}});
        if(offer!==null){
            const newId=new ObjectId(offer.selectedItems[0])
            const offeredItem=await Product.findById(newId)
            const active = await User.findOne({ is_active: true })
            const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
            const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')
            res.render('home', { isLoggedIn: res.locals.loggedIn, active, cart, wishlist ,top6Products,offeredItem,offer})
            
        }else{
            const active = await User.findOne({ is_active: true })
            const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
            const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')
            res.render('home', { isLoggedIn: res.locals.loggedIn, active, cart, wishlist ,top6Products})
        }
        
        
        
      
    } catch (error) {
        console.log('Error founded on load home ',error);
    }
}


//   this is for logout user
const logout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('error destroying sessions', err)
            }
            res.redirect('/')
        })
    } catch (error) {
        console.log(error.message);
    }
}


//   this is for loading forget pass page loading 
const forgetPass = async (req, res) => {
    try {
        res.render('forgetPass', { message: '' })
    } catch (error) {
        console.log(error.message);
    }
}


//    this is email pass and otp page rendering 
const forgetUpdate = async (req, res) => {
    try {

        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Your email is incorrect')
            return res.render('forgetPass', { message: req.flash('error') });
        }

        const generateOTP = generate4DigitOTP();
        console.log(generateOTP, 'its genereate otp after forget update');
        req.session.otp = { value: generateOTP, timestamp: Date.now() };
        req.session.userId = user._id;
        sendVerifyMail(user.name, email, generateOTP);
        res.redirect(`/forgetOtp?userId=${user._id}&email=${encodeURIComponent(email)}`);
    } catch (error) {
        console.log(error.message);
    }
}


//   forget otp load rendering
const forgetOtpLoad = async (req, res) => {
    try {
        const msg = req.flash('m')
        res.render('forgetOtp', { userId: req.query.userId, email: req.query.email, msg });
    } catch (error) {
        console.error(error.message);
    }
}


//   forget otp update here
const forgetOtpUpdate = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const { email } = req.query
        const sessionUserId = req.session.userId;
        const sessionOtp = req.session.otp;

        if (!sessionUserId || !sessionOtp || sessionOtp.value !== otp) {
            req.flash('m', 'Invalid OTP')
            res.redirect(`/forgetOtp?userId=${userId}&email=${encodeURIComponent(email)}`);
        } else {
            res.redirect('/resetPassword');
        }
    } catch (error) {
        console.error(error.message);
    }
};


//    resend otp page render
const resendOtpPage = async (req, res) => {
    try {

        const { userId, email } = req.query;
        const user = await User.findById(userId);
        if (!user || user.email !== email) {
            throw new Error('User not found or email mismatch');
        }

        const generateOTP = generate4DigitOTP();
        req.session.otp = { value: generateOTP, timestamp: Date.now() };

        sendVerifyMail(user.name, email, generateOTP);

        const referer = req.headers.referer || '/forgetOtp';
        res.redirect(referer);
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Failed to resend OTP');
        res.redirect('/forgetPass');
    }
};


//    this is the newPass rendering
const newPassLoad = async (req, res) => {
    try {
        res.render('newPass')
    } catch (error) {
        console.log(error.message);
    }
}


//    this is for new password updating 
const newPassUpadate = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body
        if (newPassword !== confirmPassword) {
            return res.render('newPass', { message: 'Password do not match,Please try again' })
        }
        const hashedPassword = await securePassword(newPassword)
        const userId = req.session.userId;

        await User.findByIdAndUpdate(userId, { password: hashedPassword })
        res.redirect('/signIn')
    } catch (error) {
        console.log(error.message);
    }
}


//   shop page rendering 
const loadShop = async (req, res) => {
    try {

        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')


        const page = (req.query.page) || 1
        const itemPerPage = 12
        const skip = (page - 1) * itemPerPage


        const categories = await Category.find({})
        let products;


        const selectedCategory = req.query.category || 'allCategory'
        const sortBy = req.query.sortby || 'popularity'
        switch (sortBy) {
            case 'lowToHigh':
                products = await Product.find().sort({ price: 1 }).populate('category').skip(skip).limit(itemPerPage)
                break;
            case 'highToLow':
                products = await Product.find().sort({ price: -1 }).populate('category').skip(skip).limit(itemPerPage)
                break;
            case 'alphabetical':
                products = await Product.find().sort({ name: 1 }).populate('category').skip(skip).limit(itemPerPage)
                break;
            case 'analphabetic':
                products = await Product.find().sort({ name: -1 }).populate('category').skip(skip).limit(itemPerPage)
                break;
            case 'latest':
                products = await Product.find().sort({ _id: -1 }).populate('category').skip(skip).limit(itemPerPage)
                break;
            default:
                products = await Product.find().populate('category').skip(skip).limit(itemPerPage)
                break;
        }


        const totalProducts = await Product.countDocuments()
        const totalPages = Math.ceil(totalProducts / itemPerPage)

        res.render('shop', { isLoggedIn: res.locals.loggedIn, cart, wishlist, products: products, categories: categories, selectedCategory, totalPages, currentPage: parseInt(page) })
    } catch (error) {
        console.log(error.message);
    }
}


//    product passing after filtering
const products = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')

        const selectedCategory = req.query.category || 'allCategory'

        const categoryId = req.query.category;
        const categories = await Category.find({})
        if (categoryId === 'allCateogry') {
            const product = await Product.find({}).populate('category');
            return res.render('shop', { products: product, categories: categories, selectedCategory, currentPage: 0, totalPages: 0 })
        }
        const product = await Product.find({ category: categoryId }).populate('category')
        res.render('shop', { isLoggedIn: res.locals.loggedIn, cart, wishlist, products: product, categories: categories, selectedCategory, currentPage: 0, totalPages: 0 })
    } catch (error) {
        console.log(error.message);
    }
}


//   search filtering 
const searchProducts = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')

        const query = req.query.q;
        const products = await Product.find({ name: { $regex: query, $options: 'i' } }).populate('category');
        const categories = await Category.find({});
        const selectedCategory = 'allCategory';
        res.render('shop', { isLoggedIn: res.locals.loggedIn, cart, wishlist, products, categories, selectedCategory, currentPage: 0, totalPages: 0 });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
};


//  this is single product showing 
const loadSingleProduct = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')
        const cart = await Cart.findOne({ userId: req.session.user_id }).populate('products')

        const productId = req.params.productId
        const product = await Product.findById(productId)
        const products = await Product.find()
        res.render('singleProduct', {isLoggedIn: res.locals.loggedIn, product, products,wishlist,cart })
    } catch (error) {
        console.log(error.message);
    }
}


//   cart page rendering
const loadCart = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')

        const userId = req.session.user_id
        if (!userId) {
            return res.render('signIn')
        } else {
            const cart = await Cart.findOne({ userId }).populate('products.productId')
            if (!cart || !cart.products) {
                return res.render('cart', { cart: { products: [] } })
            }
            res.render('cart', {isLoggedIn: res.locals.loggedIn, cart: cart ,wishlist})
        }
    } catch (error) {
        console.log(error.message);
    }
}


//    the proces of add the product to cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ userId: req.session.user_id });
        if (!cart) {
            cart = new Cart({
                userId: req.session.user_id,
                products: []
            });
        }

        const existt = await Cart.findOne({ userId: req.session.user_id, 'products.productId': productId })
        if (existt) {
            await Cart.findOneAndUpdate(
                { userId: req.session.user_id, 'products.productId': productId },
                { $inc: { 'products.$.quantity': quantity || 1 } }
            )
            res.json({ success: true, exists: true });

        } else {
            cart.products.push({
                productId: productId,
                quantity: quantity
            })
            await cart.save()
            res.json({ success: true, exists: false })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false });
    }
};


//    update cart quantity and price with incoming fetch
const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        const cart = await Cart.findOneAndUpdate(
            { userId: req.session.user_id, 'products.productId': productId },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        )
        res.json({ success: true, cart })
    } catch (error) {
        console.log(error.message + 'Error founded in update cart quantity ');
    }
}


//     remove products from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user_id
        const productId = req.params.productId
        let cart = await Cart.findOne({ userId: userId })
        cart.products = cart.products.filter(product => String(product.productId) !== productId)
        await cart.save()
        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


//    checkout page rendering
const loadCheckout = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.session.user_id }).populate('products')
        const userId = req.session.user_id
        const cart = await Cart.findOne({ userId }).populate('products.productId')
        const userAddress = await Address.findOne({ userId: req.session.user_id })
        const wallet = await Wallet.findOne({ userId: req.session.user_id })
        const walletBalance = wallet ? wallet.balance : 0
        console.log(walletBalance, 'walletbalance');
        res.render('checkout', { isLoggedIn: res.locals.loggedIn,wishlist,user_id: userId, userAddress, cart, walletBalance })

    } catch (error) {
        console.log(error.message);
    }
}


//  order place work  here
const placeOrder = async (req, res) => {

    try {
        const { userId, products, totalAmount, status, orderUserDetails, paymentMethod, couponApplied } = req.body
        let check = await Address.findOne({ 'address._id': orderUserDetails })
        let matched = check.address.find(address => address._id.toString() === orderUserDetails)

        let address = {
            name: matched.name,
            phone: matched.phone,
            email: matched.email,
            pincode: matched.pincode,
            streetAddress: matched.streetAddress,
            city: matched.city,
            state: matched.state,
            landmark: matched.landmark,
            phone2: matched.phone2
        }


        // COD not allowed above 1000
        if (paymentMethod === 'Cash on Delivery') {
            if (totalAmount > 1000) {
                return res.json({ ff: false })
            }
        }
        const cart = await Cart.findOne({ userId }).populate('products.productId')

        //we are using here checking quantity for admin fixed quanitty
        const quantityCheck = await Promise.all(cart.products.map(async (product) => {
            let productId = product.productId._id;
            let quantity = product.quantity;

            let check = await Product.findOne({ _id: productId, quantity: { $gte: quantity } });
            console.log(!!check, 'value');
            return !!check;
        }));

        if (quantityCheck.includes(false)) {
            return res.json({ mm: false });
        }

        const productData = cart.products.map((product) => ({
            productId: product.productId._id,
            quantity: product.quantity,
            name: product.productId.name,
            price: product.productId.offerApplied ? product.productId.price - (product.productId.price * product.productId.offerApplied / 100)
                : product.productId.price
        }))


        //  we are  checking here coupon amount greater than total amount
        if (couponApplied > totalAmount) {
            console.log(couponApplied, 'coupon applied ', totalAmount, 'totalamount');

            return res.json({ status: false })
        }

        const order = new Order({
            userId,
            products: productData,
            totalAmount,
            orderUserDetails: address,
            paymentMethod,
            status,
            orderDate: new Date(),
            couponApplied
        })
        await order.save()
        for (const product of productData) {
            const updateProduct = await Product.findByIdAndUpdate(product.productId, {
                $inc: { quantity: -product.quantity }
            })

        }

        await Cart.updateOne({ userId }, { $set: { products: [] } });
        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
    }
}


//  razorpay configuration here
const Razorpay = require('razorpay');
const { default: mongoose } = require('mongoose')

const createOrder = async (req, res) => {
    try {
        const { totalAmount } = req.body;
        const { RAZORPAYKEYID, RAZORPAYSECRETKEY } = process.env;
        // console.log(RAZORPAYKEYID,'razorpaykeyid ');
        // console.log(RAZORPAYSECRETKEY,'razorpaykeysecret');

        const razorpay = new Razorpay({
            key_id: RAZORPAYKEYID,
            key_secret: RAZORPAYSECRETKEY,
        });

        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: 'order_rcptid_11'
        };

        razorpay.orders.create(options, (err, order) => {
            if (err) {
                console.error('Error creating Razorpay order:', err);
                res.status(500).json({ error: 'Failed to create Razorpay order' });
            } else {
                console.log('Razorpay order created:', order);
                res.json({ orderId: order.id });
            }
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.json({ error: 'Failed to create Razorpay order' });
    }
};
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        // console.log(razorpay_order_id,'razorpay order id ',razorpay_payment_id,'payment id',
        // razorpay_signature,'signature');

        // Construct the string to be signed
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log(text, 'text in verify razorpay');

        // Generate the HMAC signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAYKEYSECRET);
        console.log(hmac, 'hmac');
        hmac.update(text);
        const generatedSignature = hmac.digest('hex');

        // Compare the signatures
        if (generatedSignature === razorpay_signature) {

            res.json({ message: 'Payment verified successfully' });
        } else {
            res.json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//  coupon get from database
const couponGet = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]
        const coupons = await Coupon.find({ expireDate: { $gt: today } })
        res.json(coupons)
    } catch (error) {
        console.log(error.message);
    }
}


//    apply coupon here 
const applyCoupon = async (req, res) => {
    try {

        const { couponCode } = req.body;
        console.log(couponCode, 'coupon code in apply code');
        let date = new Date()
        const coupon = await Coupon.findOne({ code: couponCode, expireDate: { $gte: date } });
        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found' });
        }
        const discountAmount = coupon.discountAmount || 0;
        res.json({ success: true, message: 'Coupon applied', discountAmount });
    } catch (error) {
        console.log(error.message);
    }
}


//     money adding to wallet 
const addMoneyToWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.session.user_id;
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            wallet = new Wallet({
                userId,
                balance: 0,
                transactions: []
            });
        }

        wallet.balance += amount;
        wallet.transactions.push({
            type: 'credit',
            reason: 'added money to wallet',
            date: new Date(),
            transactionAmount: amount
        });

        await wallet.save();

        res.status(200).send('Money added successfully');
    } catch (error) {
        console.error('Error adding money to wallet:', error);
        res.status(500).send('Failed to add money to wallet');
    }
};


//     payment via wallet
const processWalletPayment = async (req, res) => {
    try {
        const { totalAmount } = req.body
        const userId = req.session.user_id
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({
                userId,
                balance: 0,
                transactions: []
            });
        }

        wallet.balance -= totalAmount;
        wallet.transactions.push({
            type: 'debit',
            reason: 'purchased product',
            date: new Date(),
            transactionAmount: totalAmount
        });

        await wallet.save()

        res.status(200).send('Payment processed successfully');
    } catch (error) {
        console.log(error.message);
    }
}


//     if the user cancelled order ,that time working function
const processRefund = async (req, res) => {
    try {
        const { orderId, totalAmount } = req.body
        const order = await Order.findOne({ _id: orderId })
        if (order.paymentMethod == 'Cash on Delivery') {
            return res.json({ success: true })
        }

        const refundAmount = order.totalAmount

        const userId = req.session.user_id
        let wallet = await Wallet.findOne({ userId })

        if (!wallet) {
            return res.redirect('/home')
        }
        wallet.balance += refundAmount
        wallet.transactions.push({
            type: "credit",
            reason: 'refund',
            date: new Date(),
            transactionAmount: refundAmount
        })
        await wallet.save()
        res.json({ succuss: true })
    } catch (error) {
        console.log(error.message);
    }
}

//    render wishlist
const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const wishlist = await Wishlist.findOne({ userId }).populate('products.productId')
        if (!wishlist) {
            return res.render('wishlist',  {isLoggedIn: res.locals.loggedIn,wishlist: [] })
        }
        res.render('wishlist', {isLoggedIn: res.locals.loggedIn, wishlist })
    } catch (error) {
        console.error('Error founded in loadwishlist',error);
    }
}


//   products adding to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;
        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            const newWishlist = new Wishlist({
                userId,
                products: [{ productId }]
            });
            await newWishlist.save();
        } else {

            // const productExists = wishlist.products.some(product => product.productId.toString() === productId);
            const productExists = await Wishlist.findOne({
                userId: userId,
                products: { $elemMatch: { productId: productId } }
            })

            if (!productExists) {
                wishlist.products.push({ productId });
                await wishlist.save();
            } else {
                console.log('existed')
            }
        }
        res.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.json({ success: false, message: 'Internal server error' });
    }
};


//    remove product from wishlist 
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const productId = req.params.productId
        let wishlist = await Wishlist.findOne({ userId: userId })
        let removeProduct = await Wishlist.updateOne(
            { userId: userId }, { $pull: { products: { productId: productId } } }
        )
        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
    }
}

//     profile editing
const changeProfile = async (req, res) => {
    try {
        const { name, phone, currentPassword, newPassword, confirmPassword } = req.body
        const userId = req.session.user_id
        if (name) {
            await User.updateOne({ _id: userId }, { $set: { name: name } })
        }
        if (phone) {
            await User.updateOne({ _id: userId }, { $set: { phone: phone } })
        }

        const user = await User.findById(userId)
        const passwordMatch = await bcryptjs.compare(currentPassword, user.password)
        if (currentPassword) {
            if (passwordMatch) {
                if (newPassword == confirmPassword) {
                    spassword = await securePassword(newPassword);
                    const save = await User.findOneAndUpdate({ _id: userId },
                        {
                            password: spassword
                        }, { new: true })

                    res.redirect('/signIn')
                } else {
                    req.flash('error', 'Password is not matched')
                }
            } else {
                req.flash('error', 'Password is incorrect,please try again')
                res.redirect('/dashboard')
            }
        }
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}


//    order details page rendering
const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const productId = req.params.id
        const order = await Order.findOne({ _id: orderId }).populate('products.productId')
        const orderDetails = order.products.find(product => product.productId._id == productId)
        const aa = await Order.findOne(
            { _id: orderId, 'products.productId': productId },
            { 'products.$': 1 }
        ).populate('products.productId');
        res.render('orderDetails', {isLoggedIn: res.locals.loggedIn, order, orderDetails, aa })
    } catch (error) {
        console.error('Error founded in loadOrder', error);
    }
}


//    invoice page rendering
const loadInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const productId = req.params.productId

        const order = await Order.findOne({ _id: orderId }).populate('products.productId')
        const orderDetails = order.products.find(product => product.productId._id == productId)
        const aa = await Order.findOne(
            { _id: orderId, 'products.productId': productId },
            { 'products.$': 1 }
        ).populate('products.productId products.productId.category')
        console.log(aa, 'aa in load invoice');
        res.render('invoice', { order, aa })
    } catch (error) {
        console.error('Error founded in loadInvoice', error);
    }
}


//   contact page rendering
const loadContact = async (req, res) => {
    try {
        res.render('contact')
    } catch (error) {
        console.error('Error founded in load contact', error);
    }
}


//    about page rendering 
const loadAbout = async (req, res) => {
    try {
        res.render('about')
    } catch (error) {
        console.error('Error founded in load abount', error);
    }
}


const repayment=async(req,res)=>{
    try {
        const orderId=req.params.id
        console.log(orderId,'orderId in reapyment')
        const order = await Order.findById(orderId)
        order.status='Pending'
        await order.save()
        res.json({status:true})
        
    } catch (error) {
        console.error("Error founded in repayment",error);
    }
}



module.exports = {
    loadSignup,
    insertUser,
    otpPage,
    verifyOTP,
    resendOTP,
    loadSignIn,
    verifySignIn,
    logout,
    loadShop,
    products,
    searchProducts,
    forgetPass,
    forgetUpdate,
    forgetOtpLoad,
    resendOtpPage,
    forgetOtpUpdate,
    newPassLoad,
    newPassUpadate,
    loadHome,
    loadSingleProduct,
    loadCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    loadCheckout,
    placeOrder,
    createOrder,
    verifyRazorpay,
    couponGet,
    applyCoupon,
    addMoneyToWallet,
    processWalletPayment,
    processRefund,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    changeProfile,
    loadOrderDetails,
    loadInvoice,
    loadContact,
    loadAbout,
    repayment


}