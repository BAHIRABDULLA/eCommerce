const Category = require('../models/categoryModel')


console.log('the category page loading ...');


const categoryLoad = async (req, res) => {
    try {
        const errorMessages=req.flash('error')
        const categoryId=req.params.id
        const categories = await Category.find()
        // res.json(categories)
        // res.render('category', { categories: JSON.stringify(categories) })
        res.render('category', { categories,categoryId,errorMessages })
        console.log('catogory load is working');
    } catch (error) {
        console.log(error.message);
    }
}

// const addCategory = async (req, res) => {
//     try {
//         console.log('addcategory working');
//         const { name, description } = req.body
//         const category = new Category({
//             name,
//             description,
//             status: true
//         })
//         console.log('addcategory still going ....');
//         await category.save()
//     } catch (error) {
//         console.log(error.message);
//     }
// }

////  category adding 
const addCategory=async(req,res)=>{
    try {
        const {categoryName,categoryDescription}=req.body
        // const existingCategory = await Category.findOne({name:new RegExp(categoryName,'i')})
        const existingCategory = await Category.findOne({ name: { $regex: `${categoryName}`, $options: 'i' } });
        if(existingCategory){
            req.flash('error','Category with the same name already exists.')
            return res.redirect('/admin/category')
        }
        const newCategory=new Category({
            name:categoryName,
            description:categoryDescription,

        })
        console.log('addcategory before save');
        const savedCategory=await newCategory.save()
        console.log('addcategory after await');
        res.redirect('/admin/category')
        console.log('addcategorry after redirect');
    } catch (error) {
        console.log(error.message);
    }
}


////   edit category
const editCategory=async(req,res)=>{
    console.log('near by edit category');
    // const {editCategoryName,editCategoryDescription}=req.body
    console.log('edit category workign ');
    const categoryId=req.params.id
    console.log(categoryId);
    const editedName=req.body.name
    console.log(editedName);
    const editedDescription=req.body.des
    console.log(editedDescription);

    try {
        const existingCategoryName=await Category.findOne({name:{$regex:`${editedName}`,$options:'i'}})
        if(existingCategoryName){
            console.log('kjfdjfdkjf');
            req.flash('error','Category with the same name already exists..')
            return res.redirect('/admin/category')
        }else{
            const updateCategory = await Category.findByIdAndUpdate(categoryId,
                {name:editedName,description:editedDescription},
                {new:true});
            console.log(updateCategory);
            console.log(' category edited successfull');
            res.redirect('/admin/category')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

////   delete category
const deleteCato=async(req,res)=>{
    try {
        console.log('nooo');
        let catId=req.params.id
        await Category.findByIdAndDelete(catId)
        console.log(catId);
        res.redirect('/admin/category')
        console.log('deleteCato is working ');
    } catch (error) {
        console.log(error.message);
    }
}



const updateCategoryStatus = async (req, res) => {
    const categoryId = req.params.id;
   

    try {
        const category=await Category.findById(categoryId)
        if(!category){
            return res.status(404).json({message:'category not found'})
        }
        category.status=!category.status  
       
        res.json({status:category.status})
        await category.save()
    } catch (error) {
        console.error('Error updating category status:', error);
        res.status(500).send('Internal Server Error');
    }
};

// const loadCategory=async (req,res)=>{
//     try {
//         console.log('load category working ');
//         const categories=await Category.find()
//         res.json(categories)

//         console.log('load category still working ....');
//     } catch (error) {
//         console.log(error.message);
//     }
// }
module.exports = {
    addCategory,
    // loadCategory,
    categoryLoad,
    editCategory,
    deleteCato,
    updateCategoryStatus
    
}