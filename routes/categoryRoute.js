const express=require('express')
const category_route=express()

category_route.use(express.json())
category_route.use(express.urlencoded({extended:true}))


category_route.set('view engine','ejs')
category_route.set('views','./views/admin')
const categoryController=require('../controllers/categoryController')

category_route.get('/category',categoryController.categoryLoad)
category_route.post('/category',categoryController.addCategory)
category_route.post('/category/:id/edit',categoryController.editCategory)
category_route.get('/deleteCategory/:id',categoryController.deleteCato)
category_route.post('/category/:id/updateStatus', categoryController.updateCategoryStatus);

// category_route.get('/categories',categoryController.loadCategory)


module.exports=category_route