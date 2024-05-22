const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const mongoose = require("mongoose");

const loadCheckout = async (req, res) => {
  try {
    const user = await User.findOne({_id: req.session.user}, {firstName: 1, lastName: 1, phone: 1, Address: 1});
    const addresses = await Address.find({_id: {$in: user.Address}});
    const cart = await Cart.findOne({ userId: req.session.user });
    const productExist = await Product.findById(req.query.productId);
    if(productExist){
      let productDetails = {
        productId: productExist._id,
        name: productExist.productName,
        price: productExist.price,
        pic: productExist.productPic1,
      }
      let {brandName} = await Brand.findById(productExist.brandId);
      productDetails.brand = brandName;
      productDetails.quantity = 1;
      res.render('checkout', {
        name: user.firstName,
        user: user,
        products: [productDetails],
        cart: '',
        cartNumber: cart.products.length,
        addresses: addresses
      });
    }
    else if(cart.products.length > 0){
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
        res.render("checkout", {
          name: user.firstName,
          user: user,
          products: productDetails,
          cart: cart._id,
          cartNumber: cart.products.length,
          addresses: addresses
        });
    }
    else{
      res.redirect('/shop');
    }
  } catch (err) {
    console.log(err.message);
  }
};

const placeOrder = async (req, res) => {
  try{
    const placeOrder = async (payment) => {
      try{
        let body = {
          userId: req.session.user,
          addressId: req.body.addressId,
          paymentMethod: payment
        }
        if(req.body.orderType == 'cart order'){
          const cart = await Cart.findById(req.body.cartId);
          let products = [];
          let quantity = [];
          let productsTotal = 0;
          for(let i = 0; i < cart.products.length; i++){
            const product = await Product.findById(cart.products[i].productId);
            if(product.stock == 0){
              res.status(400).json({message: 'Sorry, the requested product is out of stock'});
              return;
            }
            else if(cart.products[i].quantity > product.stock){
              res.status(400).json({message: "Sorry, the requested product doesn't have enough stock as you requested"});
              return;
            }
            else{
              await Product.findByIdAndUpdate(product._id, {$inc: {stock: -1}});
              products.push(new mongoose.Types.ObjectId(product._id));
              quantity.push(Number(cart.products[i].quantity));
              productsTotal += product.price * cart.products[i].quantity;
            }
          }
          body.products = products;
          body.quantity = quantity;
          body.taxCharge = productsTotal * 0.28;
          body.totalCharge = productsTotal + body.taxCharge + 60;
        }
        else{
          const product = await Product.findById(req.body.productId);
          if(product.stock == 0){
            res.status(400).json({message: 'Sorry, the requested product is out of stock'});
          }
          else{
            await Product.findByIdAndUpdate(product._id, {$inc: {stock: -1}});
            body.products = [new mongoose.Types.ObjectId(product._id)];
            body.quantity = [1];
            body.taxCharge = product.price * 0.28;
            body.totalCharge = product.price + body.taxCharge + 60;
          }
        }
        const order = new Order(body);
        const orderData = await order.save();
        if(orderData){
          res.sendStatus(200);
        }
      }
      catch(err) {
        console.log(err);
        res.sendStatus(500);
      }
    }

    if(req.body.paymentMethod == 'payment_cod'){
      placeOrder('Cash on Delivery');
    }
    else{
      res.sendStatus(500)
    }
  }
  catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
}

//orders page load
const loadOrders = async (req, res) => {
  try{
    const { firstName } = await User.findById(req.session.user);
    const { products } = await Cart.findOne({userId: req.session.user});
    const orders = await Order.aggregate([
      {
        $match: {userId: new mongoose.Types.ObjectId(req.session.user)},
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'productDetails',
        }
      },
    ]);
    res.render("orders", {
      name: firstName,
      cartNumber: products.length,
      orders: orders,
    });
  }
  catch(err) {
    console.log(err)
  }
}

module.exports = {
  loadCheckout,
  placeOrder,
  loadOrders,
};
