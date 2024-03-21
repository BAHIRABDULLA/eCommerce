const express=require('express')
const category_route=express()
const flash=require('connect-flash')

category_route.use(express.json())
category_route.use(express.urlencoded({extended:true}))
const adminAuth=require('../middleware/adminAuth')
category_route.use(flash())

category_route.set('view engine','ejs')
category_route.set('views','./views/admin')
const categoryController=require('../controllers/categoryController')

category_route.get('/category',adminAuth.isLogin,categoryController.categoryLoad)
category_route.post('/category',categoryController.addCategory)
category_route.post('/category/:id/edit',categoryController.editCategory)
category_route.get('/deleteCategory/:id',categoryController.deleteCato)
category_route.post('/category/:id/updateStatus', categoryController.updateCategoryStatus);

// category_route.get('/categories',categoryController.loadCategory)


module.exports=category_route