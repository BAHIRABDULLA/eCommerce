const express=require('express')
const mongoose=require('mongoose')
const nocache=require('nocache')
const path=require('path')
const dotenv=require('dotenv')
const config=require('./config/config')

dotenv.config()

mongoose.connect(process.env.MONGOURL)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));
console.log(process.env.MONGOURL,'process.env.MONGOURL');
const app=express()

app.use(nocache())
app.use( express.static(path.join(__dirname,'public')));
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const categoryRoute=require('./routes/categoryRoute')
const productRoute=require('./routes/productRoute')
const addressRoute=require('./routes/addressRoute')
const orderRoute=require('./routes/orderRoute')
const walletRoute=require('./routes/walletRoute')
const couponRoute=require('./routes/couponRoute')
const offerRoute=require('./routes/offerRoute')

app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('/admin',categoryRoute)
app.use('/admin',productRoute)
app.use('/',addressRoute)
app.use('/',orderRoute)
app.use('/',walletRoute)
app.use('/admin',couponRoute)
app.use('/admin',offerRoute)

const port=process.env.port || 3000

app.listen(port,()=>console.log(`its running http://localhost:${port}`))  
