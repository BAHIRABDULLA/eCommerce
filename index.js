const express = require('express')
const mongoose = require('mongoose')
const nocache = require('nocache')
const path = require('path')
const dotenv = require('dotenv')
const config = require('./config/config')
const morgan = require('morgan')
const session = require('express-session')

dotenv.config()

mongoose.connect(process.env.MONGOURL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
console.log(process.env.MONGOURL, 'process.env.MONGOURL');
const app = express()

app.use(nocache())
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const categoryRoute = require('./routes/categoryRoute')
const productRoute = require('./routes/productRoute')
const addressRoute = require('./routes/addressRoute')
const orderRoute = require('./routes/orderRoute')
const couponRoute = require('./routes/couponRoute')
const offerRoute = require('./routes/offerRoute')

app.use('/admin/category', (req, res, next) => {
    console.log('categoryRoute > > > > > > >')
    next()

},categoryRoute)

app.use('/admin/coupon', (req, res, next) => {
    console.log('couponRoute > > > > > > >')
    next()
},couponRoute)
app.use('/admin/offer/', (req, res, next) => {
    console.log('offerRoute > > > > > > >')
    next()
}, offerRoute)
app.use('/admin', (req, res, next) => {

    console.log('productRoute > > > > > > >', req.originalUrl)
    next()
}, productRoute)

app.use('/admin', (req, res, next) => {
    console.log('admin route >  >  >  >  >', req.originalUrl)
    next()
}, adminRoute)
app.use('/', addressRoute)
app.use('/', orderRoute)
app.use('/', userRoute)


app.set('view engine', 'ejs')
app.set('views', './views/users')
app.get('*', (req, res) => {
    res.render('404')
})
const port = process.env.PORT || 3000

app.listen(port, () => console.log(`its running http://localhost:${port}`))  
