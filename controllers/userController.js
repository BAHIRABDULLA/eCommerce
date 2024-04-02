const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const Wishlist= require('../models/wishlistModel')

const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { ObjectId } = require('mongodb');
const userModel = require('../models/userModel');
const { isLoggedIn } = require('../middleware/auth');
const { response } = require('../routes/userRoute')



//this is otp generating 
function generate4DigitOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000)
    console.log(otp, 'first otp');
    return otp.toString()
}

//this is for email sending 
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
            // html:'<p1>Haai   '+name+',  please click here to <a  href="http://127.0.0.1:4000/verify?id='+user_id+'"> Verify </a>your mail.</p>  '
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


const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10)
    } catch (error) {
        console.log(error.message);
    }
}


// this is for signUp page loading 
const loadSignup = async (req, res) => {
    try {
        req.session.referral=req.query.referral
        
        console.log(req.session.referral,'req.session.referral');
        const errorMessage = req.flash('error')
        // console.log('haai');
        res.render('signUp', { errorMessage })
    } catch (error) {
        console.log(error.message);
    }
}


const redirectPage = (res, userData) => {
    console.log(userData, "userdata reditrect");
    res.redirect(`/otp?userId=${userData._id}&email=${encodeURIComponent(userData.email)}`);
};


////this is for insert user in sign up page
const insertUser = async (req, res) => {
    try {
        // console.log('this is fo r shahzad');
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
            console.log('passed insert user');

            // res.render('signupOtp',{message:'successful,please verify your otp'})
            redirectPage(res, userData)
            // console.log('check insert user');
        } else {
            // console.log('failed', { message: 'failed' });
            req.flash('error', 'User registration failed.Please try again ')
            res.render('signUp')
        }
    } catch (error) {
        console.log(error.message);
        req.flash('error', error.message)
        res.redirect('/signUp')
    }
}


//this is for showing OTP page
const otpPage = async (req, res) => {
    try {
        // const otp=req.query.otp
        const userId = req.query.userId
        const email = req.query.email
        console.log(email, 'this is otpPage email');
        if (!userId) {
            throw new Error('userId is missing ')
        }
        console.log(userId, "this is otpPage passed id");
        req.session.email = email
        // const user=await User.findById(userId)
        // if(!user){
        //     console.log('user not found ');
        // }
        //console.log(generateOTP,'its in otppage');
        // console.log("step1");
        // const userID=new ObjectId(userId)

        res.render('signupOtp', { userId: userId, email: email, message: '' })

    } catch (error) {

    }
}


//this is OTP verification in signUp side  
const verifyOTP = async (req, res) => {
    try {
        const enteredOTP = req.body.otp
        console.log(req.body.otp, 'its body otp');
        // console.log('check veify otp');
        const { userOTP, userId } = req.body
        console.log(req.body.userOTP, 'its in form page');
        // const userId = new ObjectId(req.body.userOTP)
        console.log(userId);
        const userIdObj = new ObjectId(userId)

        // const userData = await User.findById(req.body.userId)
        const userData = await User.findById(userIdObj)
        if (!userData) {
            res.render('signupOTP', { userId: userId, message: 'User not found' })
        }
        // console.log("hi  verifyOtp page", userData);
        // Verify OTP logic here
        const storeOtp = req.session.otp
        // const otpExpireTime=1*60*1000
        const otpExpireTime = 30 * 1000
        const otpAge = Date.now() - storeOtp.timestamp
        if (!storeOtp || otpAge > otpExpireTime) {
            // console.log('!storeOtp');
            console.log(req.session.email, 'this is req.session.email');
            return res.render('signupOtp', { userId: userId, email: req.session.email, message: 'OTP has expired,please use resend' })
        }
        // If OTP is correct, redirect to home page
        // const isOTPValid =  enteredOTP===userData.otp    
        const isOTPValid = enteredOTP === storeOtp.value
        console.log(enteredOTP, 'its is ent4ere');
        console.log(storeOtp, 'its storeOtp');
        // console.log(isOTPValid);
        if (isOTPValid) {
            console.log('stemp1');

            // const updateInfo = await User.updateOne({ _id:userData}, { $set: { is_verified: 1 } })
            // console.log(updateInfo);
            // console.log(userData);
            // const userInfo = await User.findById({ _id: userId })
            // console.log(userInfo);
            userData.is_verified = 1
            await userData.save()

            // userData.otp = undefined;
            // await updateInfo.save();
            req.session.user_id = userData._id
            var storeId = userData._id
            await req.session.save();
            console.log(req.session.referral,'await req.sessionrefere');
            if(req.session.referral){
                let wallet=await Wallet.findOne({userId:req.session.referral})
                if(!wallet){
                    wallet=new Wallet({
                        userId:req.session.referral,
                        balance:1000,
                        transactions:[{
                            type:'credit',
                            reason:'referral',
                            date:Date.now(),
                            transactionAmount:1000
                        }]
                    })
                }else{
                    wallet.balance+=1000
                    wallet.transactions.push({
                        type: 'credit',
                        reason: 'referral',
                        date: new Date(),
                        transactionAmount: 1000
                    })
                }
                await wallet.save()
                // const aa=await Wallet.findOneAndUpdate({userId:req.session.referral},
                //     {$inc:{balance:1000}} )
            }

            res.redirect('/home');
            // console.log('its going');
        } else {
            console.log('its wring otp')
            req.flash('error', 'Invalid OTP')
            // Handle invalid OTP
            // res.render('signupOtp', { userId: req.body.userId, email: req.body.email, message: 'Invalid OTP' });
            res.render('signupOtp', { userId: userId, email: req.query.email, message: req.flash('error') })
        }
    } catch (error) {
        console.log(error.message);
    }
};


// const verifyMail=async(req,res)=>{
//     try {
//        const updateInfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
//        console.log(updateInfo);
//        res.render('verifyEmail')
//     } catch (error) {
//         console.log(error.message);
//     }
// }


//this is  for sign In page showing  
const loadSignIn = async (req, res) => {
    try {
        console.log('loadsignin working');
        res.render('signIn', { message: req.flash('error') })
        // console.log('signin activating');
    } catch (error) {
        console.log(error.message);
    }
}


//this is verify signIn page
const verifySignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email, password, 'its req.body email and password in verify sign in ');

        const user = await User.findOne({ email })
        if (!user) {
            console.log('invalid first');
            return res.render('signIn', { message: 'invalid email or password' })
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            console.log('invalid second');
            req.flash('error', 'Invalid email or password,please ty again ')

            return res.render('signIn', { message: req.flash('error') })

        }
        if (user.is_verified === 0 || user.is_active === false) {
            console.log('false is active');
            req.flash('error', 'User registration failed.Please try again ')

            res.render('signIn')
        } else {

            req.session.user_id = user._id;
            // console.log(req.session.user_id, 'req.session .user id');
            await req.session.save();
            // console.log(user._id);
            console.log('verifysignin is correct ');
            console.log(req.session, 'this is req.session details');
            res.redirect('/home')
        }


    } catch (error) {
        console.log(error.message);
    }
}


//this is for resend otp 
const resendOTP = async (req, res) => {
    try {
        const { userId, email } = req.query
        console.log(email, 'this is resend OTP  email');
        console.log(userId, 'this is resend OTP userid');
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


// this is for loading home page
const loadHome = async (req, res) => {
    try {
        const active = await User.findOne({ is_active: true })
        const cart=await Cart.findOne({userId:req.session.user_id}).populate('products')
        const wishlist = await Wishlist.findOne({userId:req.session.user_id}).populate('products')
        // console.log(active);
        res.render('home', { isLoggedIn: res.locals.loggedIn, active ,cart,wishlist})
    } catch (error) {
        console.log(error.message);
    }
}

//this is for logout user
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


// this is for loading forget pass page loading 
const forgetPass = async (req, res) => {
    try {
        // console.log('its trying to enter forget pass');
        res.render('forgetPass', { message: '' })
        // console.log('its enter forget pass');
    } catch (error) {
        console.log(error.message);
    }
}


// this is email pass and otp page rendering 
const forgetUpdate = async (req, res) => {
    try {

        const { email } = req.body;
        console.log('Forget password email:', email);

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Your email is incorrect')
            return res.render('forgetPass', { message: req.flash('error') });
        }

        const generateOTP = generate4DigitOTP();
        console.log('its genereate otp after forget update');
        req.session.otp = { value: generateOTP, timestamp: Date.now() };
        req.session.userId = user._id;
        console.log(req.session.userId, 'this is session userId in forget update');
        sendVerifyMail(user.name, email, generateOTP);


        // res.redirect(`/forgetOtp?userId=${user._id}&email=${user.email}`);
        res.redirect(`/forgetOtp?userId=${user._id}&email=${encodeURIComponent(email)}`);
    } catch (error) {
        console.log(error.message);
    }
}



const forgetOtpLoad = async (req, res) => {
    try {
        const msg = req.flash('m')
        //   console.log(msg)
        res.render('forgetOtp', { userId: req.query.userId, email: req.query.email, msg });
    } catch (error) {
        console.error(error.message);
    }
}



const forgetOtpUpdate = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const { email } = req.query
        console.log(email);
        // console.log(otp ,'otp body otp ');
        const sessionUserId = req.session.userId;
        // console.log(sessionUserId,'session userId');
        const sessionOtp = req.session.otp;

        if (!sessionUserId || !sessionOtp || sessionOtp.value !== otp) {
            req.flash('m', 'Invalid OTP')
            console.log('iiiiiiiiiiiiiiiiiiiiii');
            // res.redirect(`/forgetOtp`);  
            res.redirect(`/forgetOtp?userId=${userId}&email=${encodeURIComponent(email)}`);



        } else {
            res.redirect('/resetPassword');
        }
    } catch (error) {
        console.error(error.message);
        // req.flash('error', 'Something went wrong, please try again');
        // console.log('bbbbbbbbb');
        // res.redirect('/forgetOtp');
    }
};


const resendOtpPage = async (req, res) => {
    try {

        const { userId, email } = req.query;

        console.log(email, 'this is resendotp email');
        console.log(userId, 'this is resendotp userid');

        // Fetch user details from the database
        const user = await User.findById(userId);
        if (!user || user.email !== email) {
            throw new Error('User not found or email mismatch');
        }

        // Generate a new OTP
        const generateOTP = generate4DigitOTP();
        req.session.otp = { value: generateOTP, timestamp: Date.now() };

        // Send the new OTP via email
        sendVerifyMail(user.name, email, generateOTP);

        // Redirect back to the same page where resend was requested
        // Assuming the page URL is stored in req.headers.referer
        const referer = req.headers.referer || '/forgetOtp';
        res.redirect(referer);
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Failed to resend OTP');
        // Redirect to the forget password page with an error message
        res.redirect('/forgetPass');
    }
};






// this is the newPass rendering
const newPassLoad = async (req, res) => {
    try {
        res.render('newPass')
    } catch (error) {
        console.log(error.message);
    }
}


// this is for new password updating 
const newPassUpadate = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body
        if (newPassword !== confirmPassword) {
            return res.render('newPass', { message: 'Password do not match,Please try again' })
        }
        const hashedPassword = await securePassword(newPassword)
        console.log(hashedPassword, 'this is hashed password');
        const userId = req.session.userId;
        console.log(userId, 'user_id from session');
        // const userId = storeId


        await User.findByIdAndUpdate(userId, { password: hashedPassword })
        res.redirect('/signIn')
    } catch (error) {
        console.log(error.message);
    }
}



// // this is shop page rendering 
// const loadShop = async (req, res) => {
//     try {
//         const categories=await Category.find({})
//         const products = await Product.find().populate('category')
//         const selectedCategory=req.query.category||'allCategory'
//         res.render('shop', { products: products ,categories:categories,selectedCategory})
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const 
loadShop = async (req, res) => {
    try {
        const page=(req.query.page)||1
        const itemPerPage =10 
        const skip=(page-1)*itemPerPage


        const categories = await Category.find({})
        // const products = await Product.find().populate('category')
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

        
        const totalProducts =await Product.countDocuments()
        const totalPages=Math.ceil(totalProducts/itemPerPage)

        res.render('shop', { products: products, categories: categories, selectedCategory,totalPages,currentPage:page })
    } catch (error) {
        console.log(error.message);
    }
}

const products = async (req, res) => {
    try {
        const selectedCategory = req.query.category || 'allCategory'

        const categoryId = req.query.category;
        const categories = await Category.find({})

        console.log(categoryId)
        if (categoryId === 'allCateogry') {
            // console.log('ininin')
            const product = await Product.find({}).populate('category');
            return res.render('shop', { products: product, categories: categories, selectedCategory })
        }

        // console.log(categoryId,'category Id in products paage');
        // const category =await Category.find({_id:categoryId})
        const product = await Product.find({ category: categoryId }).populate('category')
        // console.log('ihn');
        res.render('shop', { products: product, categories: categories, selectedCategory })


        // console.log(product,'fdjfdkf')
    } catch (error) {
        console.log(error.message);
    }
}
const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        console.log(query,'query in search products');
        const products = await Product.find({ name: { $regex: query, $options: 'i' } }).populate('category');
        const categories = await Category.find({});
        const selectedCategory = 'allCategory';
        res.render('shop', { products, categories, selectedCategory });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Failed to search products' });
    }
};




//  this is single product showing 
const loadSingleProduct = async (req, res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId)
        const products = await Product.find()
        res.render('singleProduct', { product, products })
    } catch (error) {
        console.log(error.message);
    }
}



const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id
        if (!userId) {
            return res.render('signIn')
        } else {
            const cart = await Cart.findOne({ userId }).populate('products.productId')
            if (!cart || !cart.products) {
                return res.render('cart', { cart: { products: [] } })
            }
            res.render('cart', { cart: cart })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log(productId,'productId',quantity,'quantitiy in addToCart');
       

        let cart = await Cart.findOne({ userId: req.session.user_id });
        if (!cart) {
            cart = new Cart({
                userId: req.session.user_id,
                products: []
            });
        }
        console.log(cart,'cart in addtocart');
        
        // const existt =await Cart.aggregate([
        //     {$match:{productId:{$exists:true},productId:productId}}
        // ])
        const existt=await Cart.findOne({userId:req.session.user_id,'products.productId':productId})
        console.log(existt,'existtt ');
        if(existt){
            await Cart.findOneAndUpdate(
                {userId:req.session.user_id,'products.productId':productId},
                {$inc:{'products.$.quantity':quantity||1}}
            ) 
            res.json({ success: true, exists: true });

        }else{
            cart.products.push({
                productId:productId,
                quantity:quantity
            })
            await cart.save()
            res.json({success:true,exists:false})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false });
    }
};


const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        console.log(productId,'prodouct id in ');
        // const { quantity, totalPrice } = req.body
        const {quantity}=req.body
        console.log('quantity in updateCartQuantity',quantity);


        const cart = await Cart.findOneAndUpdate(
            { userId: req.session.user_id, 'products.productId': productId },
            { $set: { 'products.$.quantity': quantity} },
            { new: true }
        )
        console.log(cart,'cart in update cart quantity');
        res.json({ success: true, cart })
    } catch (error) {

        console.log(error.message+'dfdfdff');
    }
}






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


// const loadCheckout = async (req, res) => {
//     try {
//         const userId = req.session.user_id
//         console.log(userId, 'this is loadcheck out userId');
//         const cart = await Cart.findOne({ userId }).populate('products.productId')
//         // console.log(cart,'this is loadcheck out cart');
//         const subtotal = cart.products.reduce((accu, curr) => accu + curr.totalPrice, 0)
//         console.log(subtotal, 'this is subtotal in loadCheckout page');
//         const deliveryCharges = subtotal < 500 ? 50 : 0
//         console.log(deliveryCharges, 'this is delivery charges in loadcheck out page');
//         const totalAmount = subtotal + deliveryCharges
//         console.log(totalAmount, 'this is total amount in load check out page ');

//         const userAddress = await Address.findOne({ userId: req.session.user_id })
//         console.log(userAddress, 'userAddress in load checkout page ');

//         const wallet= await Wallet.findOne({userId:req.session.user_id})
//         const walletBalance=wallet? wallet.balance:0
//         console.log(walletBalance,'walletbalance');
//         res.render('checkout', { user_id: userId, userAddress, cart, subtotal, deliveryCharges, totalAmount,walletBalance })
       
//     } catch (error) {
//         console.log(error.message);
//     }
// }



const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id
        console.log(userId, 'this is loadcheck out userId');
        const cart = await Cart.findOne({ userId }).populate('products.productId')
        // console.log(cart,'this is loadcheck out cart')

        const userAddress = await Address.findOne({ userId: req.session.user_id })
        // console.log(userAddress, 'userAddress in load checkout page ');

        const wallet= await Wallet.findOne({userId:req.session.user_id})
        const walletBalance=wallet? wallet.balance:0
        console.log(walletBalance,'walletbalance');
        res.render('checkout', { user_id: userId, userAddress, cart, walletBalance })
       
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {                                               

    try {
        const { userId, products, totalAmount, orderUserDetails, paymentMethod } = req.body
        // const address=await Address.findById({orderUserDetails})
        console.log(userId, 'userId in placeholder page');
        console.log(orderUserDetails, 'ordreUserDetails in my placeorder page')
        let check=await Address.findOne({'address._id':orderUserDetails})
        let matched=check.address.find(address=>address._id.toString()===orderUserDetails)
        // console.log(matched,'matched');
        // console.log(check,'check in placeorder');
        let address={
            name:matched.name,
            phone:matched.phone,
            email:matched.email,
            pincode:matched.pincode,
            streetAddress:matched.streetAddress,
            city:matched.city,
            state:matched.state,
            landmark:matched.landmark,
            phone2:matched.phone2
        }
        console.log(address,'address');

        const cart = await Cart.findOne({ userId }).populate('products.productId')
        // const address = await Address.findOne({"address._id":orderUserDetails});

        // console.log(address,'address in placeorder page');



        const productData = cart.products.map((product) => ({
            productId: product.productId._id,
            quantity: product.quantity,
            name: product.productId.name,
            price:product.productId.offerApplied?product.productId.price-(product.productId.price*product.productId.offerApplied/100)
                  : product.productId.price
        }))


        // console.log(address,'orderuser details in place holder page');
        const order = new Order({
            userId,
            products: productData,
            totalAmount,
            orderUserDetails:address,
            paymentMethod,
            status: 'Pending',
            orderDate: new Date()
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




const Razorpay = require('razorpay');
const { default: mongoose } = require('mongoose')

const createOrder = async (req, res) => {
    try {
        console.log('its here create order function in user controller ');
        const { totalAmount } = req.body;
        console.log(totalAmount,'totalAmount in create order function in usercon');
        const { RAZORPAYKEYID, RAZORPAYSECRETKEY } = process.env;
        console.log(RAZORPAYKEYID,'razorpaykeyid ');
        console.log(RAZORPAYSECRETKEY,'razorpaykeysecret');

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
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};


const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log(razorpay_order_id,'razorpay order id ',razorpay_payment_id,'payment id',
        razorpay_signature,'signature');

        // Construct the string to be signed
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log(text,'text in verify razorpay');
        
        // Generate the HMAC signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAYKEYSECRET);
        console.log(hmac,'hmac');
        hmac.update(text);
        const generatedSignature = hmac.digest('hex');

        // Compare the signatures
        if (generatedSignature === razorpay_signature) {
            // Signature matches, payment is valid
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            // Signature does not match, payment is not valid
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const couponGet=async(req,res)=>{
    try {
        const today=new Date().toISOString().split('T')[0]
        console.log(today,'today in coupon get ');
        const coupons = await Coupon.find({expireDate:{$gt:today}})
        console.log(coupons,'coupons in coupon get ');

        res.json(coupons)
    } catch (error) {
        console.log(error.message);
    }
}

const applyCoupon=async (req,res)=>{
    try {
        console.log('its here also in apply coupon ');
        const { couponCode } = req.body;
         console.log(couponCode,'coupon code in apply code');
        const coupon = await Coupon.findOne({ code: couponCode });
        console.log(coupon,'coupon in apply code apply coupon ')
        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found' });
        }
        const discountAmount = coupon.discountAmount || 0;
        console.log(discountAmount,'discount amount in apply code');
        
        res.json({ success: true, message: 'Coupon applied', discountAmount });
    } catch (error) {
        console.log(error.message);
    }
}

const addMoneyToWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log(amount ,'amount in addmoney to wallet');
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

const processWalletPayment=async(req,res)=>{
    try {
        const {totalAmount}=req.body
        console.log(totalAmount,'totalamount processWallet payment');
        const userId=req.session.user_id
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


const processRefund=async(req,res)=>{
    try {
        const {orderId,totalAmount }=req.body
        const order= await Order.findOne({_id:orderId})
        console.log(order,'aa');
        let refundAmount=order.totalAmount
        
        console.log(orderId,'order id in process refund ');
        console.log(refundAmount,'refundAmount in process refund amount');
        const userId=req.session.user_id
        let wallet =await Wallet.findOne({userId})

        if(!wallet){
            return res.redirect('/home')
        }
        wallet.balance+=refundAmount 
        wallet.transactions.push({
            type:"credit",
            reason:'refund',
            date:new Date(),
            transactionAmount:refundAmount
        })
        await wallet.save()
    } catch (error) {
        console.log(error.message);
    }
}

const loadWishlist=async(req,res)=>{
    try {
        const userId=req.session.user_id
        console.log(userId,'userId in loadwishlist');
        const wishlist=await Wishlist.findOne({userId}).populate('products.productId')

        if(!wishlist){
            return res.render('wishlist',{wishlist:[]})
        }
        res.render('wishlist',{wishlist})
    } catch (error) {
        console.log(error.message);
    }
}

// const getWishlist = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         console.log(userId, 'userId in loadwishlist');
//         const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');
        
//         if (!wishlist) {
//             return res.json({ products: [] }); 
//         }
//         res.json({ products: wishlist.products }); 
//     } catch (error) {
//         console.error('Error fetching wishlist data:', error);
//     }
// };

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log(typeof(productId),'dfdsf',productId,'produ');
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
            const productExists=await Wishlist.findOne({
                userId:userId,
                products:{$elemMatch:{productId:productId}}
            })
            console.log(productExists,'product Exists');
            
            if (!productExists) {
                wishlist.products.push({ productId });
                await wishlist.save();
            }else{
                console.log('existed')
            }
        }

        res.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.json({ success: false, message: 'Internal server error' });
    }
};

const removeFromWishlist=async(req,res)=>{
    try {
        const userId = req.session.user_id
        const productId = req.params.productId
        let wishlist = await Wishlist.findOne({ userId: userId })
        // wishlist.products = wishlist.products.filter(product => String(product.productId) !== productId)
        let removeProduct=await Wishlist.updateOne(
            {userId:userId},{$pull:{products:{productId:productId}}}
        )

        console.log(removeProduct,'remove product');
        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
    }
}


const changeProfile=async (req,res)=>{
    try {
        const { name ,phone,currentPassword,newPassword,confirmPassword}=req.body
        console.log(currentPassword,'current password');
        // const spassword=await securePassword(currentPassword)
        
        const userId=req.session.user_id
        if(name){
            await User.updateOne({_id:userId},{$set:{name:name}})
        }
        if(phone){
            await User.updateOne({_id:userId},{$set:{phone:phone}})
        }

        const user=await User.findById(userId)
        const passwordMatch=await bcrypt.compare(currentPassword,user.password)
        console.log(passwordMatch,'passwordMatch');
        if(currentPassword){
            if(passwordMatch){
                if(newPassword==confirmPassword){
                    spassword=await securePassword(newPassword);
            
                    console.log(spassword,'spassword win');
                    const save=await User.findOneAndUpdate({_id:userId},
                        {
                        password:spassword
                    },{new:true})
                    console.log(save,'savae');
                
                    res.redirect('/signIn')
                }else{
                    req.flash('error','Password is not matched')
                }
            }else{
                req.flash('error','Password is incorrect,please try again')
                res.redirect('/dashboard')
            }
        }
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails=async (req,res)=>{
    try {
        const orderId=req.params.orderId
        console.log(orderId,'orderId in loadorderDetails');
        const productId=req.params.id
        console.log(productId,'productId in loadOrderDetails');
        const order=await Order.findOne({_id:orderId}).populate('products.productId')
        console.log(order,'order in loadorderdetails');
        const orderDetails=order.products.find(product=>product.productId._id==productId)
        console.log(orderDetails,'orderDetails');
        const aa = await Order.findOne(
            { _id: orderId, 'products.productId': productId }, 
            { 'products.$': 1 } 
        ).populate('products.productId'); 
        console.log(aa,'aa');
        res.render('orderDetails',{order,orderDetails,aa})
    } catch (error) {
        console.error('Error founded in loadOrder',error);
    }
}


module.exports = {
    loadSignup,
    insertUser,
    otpPage,
    verifyOTP,
    resendOTP,
    // verifyMail,
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
    // loadDashboard,
    loadCart,
    addToCart,
    updateCartQuantity,
    // cartAdd,
    // updateCart,
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
    // getWishlist,
    addToWishlist,
    removeFromWishlist,
    changeProfile,
    loadOrderDetails


   
}