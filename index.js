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
const couponRoute=require('./routes/couponRoute')
const offerRoute=require('./routes/offerRoute')
app.use('/',addressRoute)
app.use('/',orderRoute)
app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('/admin',categoryRoute)
app.use('/admin',productRoute)
app.use('/admin',couponRoute)
app.use('/admin',offerRoute)


app.set('view engine', 'ejs')
app.set('views', './views/users')
app.get('*',(req,res)=>{
    res.render('404')
})
const port=process.env.PORT || 3000

app.listen(port,()=>console.log(`its running http://localhost:${port}`))  
