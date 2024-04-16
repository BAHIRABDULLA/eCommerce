const Category = require('../models/categoryModel')


//     category page rendering
const categoryLoad = async (req, res) => {
    try {
        const errorMessages = req.flash('error')
        const categoryId = req.params.id
        const categories = await Category.find()
        res.render('category', { categories, categoryId, errorMessages })
    } catch (error) {
        console.log(error.message);
    }
}


//     category adding 
const addCategory = async (req, res) => {
    try {
        const { categoryName, categoryDescription } = req.body
        const existingCategory = await Category.findOne({ name: { $regex: `${categoryName}`, $options: 'i' } });
        if (existingCategory) {
            req.flash('error', 'Category with the same name already exists.')
            return res.redirect('/admin/category')
        }
        const newCategory = new Category({
            name: categoryName,
            description: categoryDescription,

        })
        const savedCategory = await newCategory.save()
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}


//     edit category
const editCategory = async (req, res) => {

    try {
        const categoryId = req.params.id
        const editedName = req.body.name
        const editedDescription = req.body.des

        const existingCategoryName = await Category.findOne({ name: { $regex: `${editedName}`, $options: 'i' }, _id: { $ne: categoryId } })

        if (existingCategoryName) {
            req.flash('error', 'Category with the same name already exists..')
            return res.redirect('/admin/category')
        } else {
            const updateCategory = await Category.findByIdAndUpdate(categoryId,
                { name: editedName, description: editedDescription },
                { new: true });
            console.log(updateCategory);
            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
    }
}


//     delete category
const deleteCato = async (req, res) => {
    try {
        const catId = req.params.id
        await Category.findByIdAndDelete(catId)
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
}


//    changing category status
const updateCategoryStatus = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.status(404).json({ message: 'category not found' })
        }
        category.status = !category.status

        res.json({ status: category.status })
        await category.save()
    } catch (error) {
        console.error('Error updating category status:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    addCategory,
    categoryLoad,
    editCategory,
    deleteCato,
    updateCategoryStatus

}