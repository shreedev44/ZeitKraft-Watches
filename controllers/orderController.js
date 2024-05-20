const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require('../models/addressModel');

const loadCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.user });
    if(cart.products.length == 0){
        res.redirect('/shop');
    }
    else{
        const user = await User.findOne({_id: req.session.user}, {firstName: 1, lastName: 1, phone: 1, Address: 1});
        let productDetails = [];
        for (let i = 0; i < cart.products.length; i++) {
          let product = {};
          let { productName, price, productPic1, brandId, _id } =
            await Product.findById(cart.products[i].productId);
          product.productId = _id;
          product.name = productName;
          product.price = price;
          product.pic = productPic1;
          let { brandName } = await Brand.findById(brandId);
          product.brand = brandName;
          product.quantity = cart.products[i].quantity;
          productDetails.push(product);
        }
        const addresses = await Address.find({_id: {$in: user.Address}});
        res.render("checkout", {
          name: user.firstName,
          user: user,
          cart: cart,
          products: productDetails,
          cartNumber: cart.products.length,
          addresses: addresses
        });
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadCheckout,
};
