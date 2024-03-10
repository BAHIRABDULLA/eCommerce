const express=require('express')
const mongoose=require('mongoose')
const nocache=require('nocache')
const path=require('path')
const dotenv=require('dotenv')
const config=require('./config/config')
mongoose.connect('mongodb://localhost:27017/firstProject')
dotenv.config()
const app=express()



// console.log(process.env)
// console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

// app.set('view engine','ejs')
// app.set('views','./views/users')

// app.use('/home',(req,res)=>{
//     res.render('home')
// })
app.use(nocache())
app.use( express.static(path.join(__dirname,'public')));
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const categoryRoute=require('./routes/categoryRoute')
const productRoute=require('./routes/productRoute')
const addressRoute=require('./routes/addressRoute')
app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('/admin',categoryRoute)
app.use('/admin',productRoute)
app.use('/',addressRoute)

app.listen(4000,()=>console.log('its running http://localhost:4000'))  