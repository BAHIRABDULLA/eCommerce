const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer=require('nodemailer')

function generate4DigitOTP(){
   const otp = Math.floor(1000+(Math.random() * 9000))
   console.log(otp,'this is function generator');
   return otp.toString()
}

// const otp=generate4DigitOTP()
// console.log(otp,'this is otp created ');
const sendVerifyMail=async(name,email,otp)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            // service:'gmail',
            auth:{
                user:'bahirbusiness123@gmail.com',
                pass:'mtor uklo ubeq atzx'
            }       
        })
        const mailOptions ={
            from:'bahirbusiness123@gmail.com',
            to:email,
            subject:'For Verification OTP',
            html:`<p>Your Molla e-commerce website otp is ${otp} </P>`
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log('Error sending Email',error);
            }else{
                console.log('Email sent',info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
    
}

//  first
const loadSignup = async (req, res) => {
    try {
        console.log(' loadsignup working');
        res.render('signUp')
    } catch (error) {
        console.log(error.message);
    }
}


const redirectPage=(res,userId)=>{
    res.redirect(`/otpPage?userId=${userId}`)
}

//adding user in sign up page
const insertUser = async (req, res) => {
    try {
        const {name,email,phone,password}=req.body

        const existingUser=await User.findOne({email})
        if(existingUser){
            req.flash('error','Email already exist ,please use another email')
            return res.redirect('/signUp')
            // res.send('Email already exist ,please use another email')

        }

        if (!/^[a-zA-Z]+$/.test(name.replace(/\s/g, ''))) {
            // return res.send('Please use Correct name');
            req.flash('error','Please enter correct name')
            return res.redirect('/signUp')
        }

        if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
            req.flash('error','Phone number should contain 10 digits')
             return res.redirect('/signUp')
            // return res.send('Phone number should contain 10 digits without whitespaces');
        }
        const spassword=await bcrypt.hash(password,10)
        const user=new User({
            name,
            email,
            phone,
            password:spassword
        })
        
        const userData=await user.save()
        const userId=userData._id
        console.log(userData);
        if(userData){
            const generateOTP=generate4DigitOTP()
            req.session.otp=generateOTP
            // sentverifymail(req.body.email,generateOTP)
            sendVerifyMail(req.body.name,req.body.email,generateOTP)

            console.log(generateOTP,'this is insert user otp');
            // res.render('signupOtp')
            redirectPage(res,userId)
        }else{
             req.flash('error','Please try again')
            res.render('singUp')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const otpPage=async(req,res)=>{
    try {
        const userId=req.query.userId
        console.log(userId,'userId in otp page');
        res.render('signupOtp',{userId})
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOTP=async (req,res)=>{
    try {
        const storeOtp=req.session.otp
        console.log(storeOtp,'storeOTP');
        const enteredOTP=req.body.otp
        console.log(enteredOTP,'enteredotp');
        const isOTPValid=storeOtp===enteredOTP
        console.log(isOTPValid);
        if(isOTPValid){
            const userId=req.body.userId
            // console.log(userData);
            console.log(userId);
            const updateInfo=await User.updateOne({_id:userId},{$set:{is_verified:1}})
            // console.log(,'this is userData in verifyOtp');
            console.log(updateInfo,'updateinfo');
            // res.render('home')
            if(updateInfo.nModified===1){
                res.redirect('/home')
            }else{
                res.render('signupOtp')
            }
        }else{
            res.render('signupOtp')
            console.log('do it again');
        }
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadHome =async (req,res)=>{
    try {
        res.render('home')
        console.log('its home bro');
    } catch (error) {
        console.log(error.message);
    }
}

const loadSignin=async (req,res)=>{
    try {
        res.render('signIn')
        console.log('loadsignin working');
    } catch (error) {
        console.log(error.message);
    }
}

const verifySignIn=async (req,res)=>{
    try {
        // const {email,password}=req.body
        // const spassword=await bcrypt.hash(password,10)
        // console.log(spassword,'verifySignIn');
        // console.log(userData.password,'verifySignIn userData.password');
        // isVerifySign=spassword===userData.password
        // console.log(isVerifySign,'true or false');
        const email=req.body.email
        const password=req.body.password 
        const userData =await User.findOne({email:email})
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_verified==0){
                    res.render('signIn')
                }else{
                    res.redirect('/home')
                }
            }else{
                res.render('signIn')
            }
            // res.render('home')
        }else{
            res.render('signIn')
        }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadSignup,
    insertUser,
    otpPage,
    verifyOTP,
    loadHome,
    loadSignin,
    verifySignIn

}    
    