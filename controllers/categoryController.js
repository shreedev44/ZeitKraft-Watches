const Category = require('../models/categoryModel');
const fs = require('fs');
const path = require('path')


//load categories page
const loadCategories = async (req, res) => {
    try{
        let search = req.query.search;
        let query = {};
        if(search){
            query = {
                categoryName: { $regex: search, $options: "i" }
            }
        }
        const categories = await Category.find(query);
        res.render('categories', {categories: categories, search: search, name: req.session.admin});
    }
    catch(err){
        console.log(err.message)
    }
}


//load add category page
const loadAddCategories = async (req, res) => {
    try{
        res.render('addCategories', {name: req.session.admin})
    }
    catch (err) {
        console.log(err.message);
    }
}




//adding category
const addCategory = async (req, res) => {
    try{
        const { filename } = req.file;
        const categoryName = req.body.title;


        const isExisting = await Category.find({categoryName: categoryName});
        if(isExisting.length == 0){
            const category = new Category({
                categoryName: categoryName,
                categoryPic: filename,
                delete: false,
            });

            const categoryData = await category.save();
            if(categoryData){
                res.sendStatus(200);
            }
            else{
                res.sendStatus(500);
            }
        }
        else{
            res.status(400).json({error: 'Category already exists'})
        }
    }
    catch (err){
        console.log(err.message);
    }
}


//load edit category page
const loadEditCategory = async (req, res) => {
    try{
        const categoryId = req.query.categoryId;

        const category = await Category.findById(categoryId);
        res.render('editCategory', {category: category, name: req.session.admin});
    }
    catch (err) {
        console.log(err.message);
    }
}


//edit category
const editCategory = async (req, res) => {
    try{
        const categoryId = req.query.categoryId;
        const oldCategory = await Category.findById(categoryId);
        const oldImage = oldCategory.categoryPic;

        const editBody = {};
        if(req.body.title){
            editBody.categoryName = req.body.title
        }
        if(req.file){
            editBody.categoryPic = req.file.filename
        }
        await Category.findByIdAndUpdate(categoryId, editBody);
        if (oldImage) {
            const imagePath = path.join(__dirname, "..", "public", "uploads", "categories", oldImage);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log("Error deleting old image:", err);
                }
            });
        }
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        res.sendStatus(500);
    }
}


//delete category
const deleteCategory = async (req, res) => {
    try{
        await Category.findByIdAndUpdate(req.query.categoryId, {delete: true});
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        res.sendStatus(500);
    }
}


//restore category
const restoreCategory = async (req, res) => {
    try{
        await Category.findByIdAndUpdate(req.query.categoryId, {delete: false});
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        res.sendStatus(200);
    }
}


module.exports = {
    loadCategories,
    loadAddCategories,
    addCategory,
    loadEditCategory,
    editCategory,
    deleteCategory,
    restoreCategory,
}