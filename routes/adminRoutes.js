const express = require('express');
const session = require('express-session');
const config = require('../config/config');
const Auth = require('../middlewares/adminAuth');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const multer = require('../config/multer');
const adminRouter = express();

adminRouter.use(
    session({
        secret: config.sessionSecret,
        saveUninitialized: false,
        resave: false
    })
);

adminRouter.set("view engine", "ejs");
adminRouter.set("views", "./views/admin");
adminRouter.use(express.json());
adminRouter.use(express.urlencoded({ extended: true }));

//default route
adminRouter.get('/', Auth.isLogout, adminController.loadLogin);

//admin Login
adminRouter.get('/login', Auth.isLogout, adminController.loadLogin)

//verify admin
adminRouter.post('/login', adminController.verifyAdmin)

//dashboard
adminRouter.get('/dashboard', Auth.isLogin, adminController.loadDashboard);

//users
adminRouter.get('/users', Auth.isLogin, adminController.loadUsers);

//block or unblock route
adminRouter.patch('/users', adminController.blockUser);

//products
adminRouter.get('/products',Auth.isLogin, productController.loadProducts);

//add products page load
adminRouter.get('/add-product', Auth.isLogin, productController.loadAddProduct);

//add product
adminRouter.post('/add-product', Auth.isLogin, multer.uploadProduct.array('files', 3), productController.addProduct);

//delete or restore product
adminRouter.delete('/delete-product', Auth.isLogin, productController.deleteProduct);

//list products
adminRouter.patch('/list-product', Auth.isLogin, productController.listProduct)

//edit product page load
adminRouter.get('/edit-product',Auth.isLogin, productController.loadEditProduct);

//edit product
adminRouter.patch('/edit-product', Auth.isLogin, multer.uploadProduct.any(), productController.editProduct);

//categories
adminRouter.get('/categories', Auth.isLogin, categoryController.loadCategories);

//add category load
adminRouter.get('/add-category', Auth.isLogin, categoryController.loadAddCategories);

//add category
adminRouter.post('/add-category', Auth.isLogin, multer.uploadCategory.single('file'), Auth.isFileSupported, categoryController.addCategory )

//edit category load
adminRouter.get('/edit-category', Auth.isLogin, categoryController.loadEditCategory);

//edit category
adminRouter.patch('/edit-category', Auth.isLogin, multer.uploadCategory.single('file'), categoryController.editCategory);

//list category
adminRouter.patch('/list-category', Auth.isLogin, categoryController.listCategory);

//delete category
adminRouter.delete('/delete-category', Auth.isLogin, categoryController.deleteCategory);

//brands load
adminRouter.get('/brands', Auth.isLogin, brandController.loadBrands);

//add category load
adminRouter.get('/add-brand', Auth.isLogin, brandController.loadAddBrand);

//add category
adminRouter.post('/add-brand', Auth.isLogin, multer.uploadBrand.single('file'), brandController.addBrand);

//edit brand load
adminRouter.get('/edit-brand',Auth.isLogin, brandController.loadEditBrand);

//edit brand
adminRouter.patch('/edit-brand', Auth.isLogin, multer.uploadBrand.single('file'), brandController.editBrand);

//delete brand
adminRouter.delete('/delete-brand',Auth.isLogin, brandController.deleteBrand);

//list brand
adminRouter.patch('/list-brand', Auth.isLogin, brandController.listBrand);

//logout
adminRouter.get('/logout', Auth.isLogin, adminController.logout)


module.exports = adminRouter;