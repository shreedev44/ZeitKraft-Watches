const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

function generateOID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'OID-';
  for (let i = 0; i < length; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

const loadCheckout = async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req.session.user },
      { firstName: 1, lastName: 1, phone: 1, Address: 1 }
    );
    const addresses = await Address.find({ _id: { $in: user.Address } });
    const cart = await Cart.findOne({ userId: req.session.user });
    const productExist = await Product.findById(req.query.productId);
    if (productExist) {
      let productDetails = {
        productId: productExist._id,
        name: productExist.productName,
        price: productExist.price,
        pic: productExist.productPic1,
      };
      let { brandName } = await Brand.findById(productExist.brandId);
      productDetails.brand = brandName;
      productDetails.quantity = 1;
      res.render("checkout", {
        name: user.firstName,
        user: user,
        products: [productDetails],
        cart: "",
        cartNumber: cart.products.length,
        addresses: addresses,
      });
    } else if (cart.products.length > 0) {
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
        addresses: addresses,
      });
    } else {
      res.redirect("/shop");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const placeOrder = async (payment) => {
      try {
        let body = {
          userId: req.session.user,
          addressId: req.body.addressId,
          paymentMethod: payment,
        };
        if (req.body.orderType == "cart order") {
          const cart = await Cart.findById(req.body.cartId);
          let products = [];
          let productsTotal = 0;
          for (let i = 0; i < cart.products.length; i++) {
            const product = await Product.findById(cart.products[i].productId);
            if (product.stock == 0) {
              res.status(400).json({
                message: "Sorry, the requested product is out of stock",
              });
              return;
            } else if (cart.products[i].quantity > product.stock) {
              res.status(400).json({
                message:
                  "Sorry, the requested product doesn't have enough stock as you requested",
              });
              return;
            } else {
              await Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -1 },
              });
              let currentDate = new Date();
              let last = new Date();
              currentDate.setDate(currentDate.getDate() + 7);
              products.push({
                productId: new mongoose.Types.ObjectId(product._id),
                quantity: Number(cart.products[i].quantity),
                status: "Placed",
                deliveryDate: currentDate,
                lastUpdated: last,
              });
              productsTotal += product.price * cart.products[i].quantity;
            }
          }
          body.OID = generateOID(16);
          body.products = products;
          body.taxCharge = productsTotal * 0.28;
          body.totalCharge = productsTotal + body.taxCharge + 60;

          await Cart.findByIdAndUpdate(cart._id, { products: [] });
        } else {
          const product = await Product.findById(req.body.productId);
          if (product.stock == 0) {
            res.status(400).json({
              message: "Sorry, the requested product is out of stock",
            });
          } else {
            await Product.findByIdAndUpdate(product._id, {
              $inc: { stock: -1 },
            });
            let currentDate = new Date();
            let last = new Date();
            currentDate.setDate(currentDate.getDate() + 7);
            body.products = [
              {
                productId: new mongoose.Types.ObjectId(product._id),
                quantity: 1,
                status: "Placed",
                deliveryDate: currentDate,
                lastUpdated: last,
              },
            ];
            body.OID = generateOID(16);
            body.taxCharge = product.price * 0.28;
            body.totalCharge = product.price + body.taxCharge + 60;
          }
        }
        const order = new Order(body);
        const orderData = await order.save();
        if (orderData) {
          res.status(200).json({ id: orderData._id });
        }
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
    };

    if (req.body.paymentMethod == "payment_cod") {
      placeOrder("Cash on Delivery");
    } else {
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//orders page load
const loadOrders = async (req, res) => {
  try {
    const { firstName } = await User.findById(req.session.user);
    const { products } = await Cart.findOne({ userId: req.session.user });
    let orders = await Order.find({ userId: req.session.user });
    for (let i = 0; i < orders.length; i++) {
      orders[i] = orders[i].toObject();
      orders[i].productDetails = [];
      for (let j = 0; j < orders[i].products.length; j++) {
        let productData = await Product.findById(
          orders[i].products[j].productId
        );
        productData = productData.toObject();
        const { brandName } = await Brand.findById(productData.brandId);
        productData.brand = brandName;
        orders[i].productDetails.push(productData);
      }
    }
    res.render("orders", {
      name: firstName,
      cartNumber: products.length,
      orders: orders,
    });
  } catch (err) {
    console.log(err);
  }
};

//track order
const trackOrder = async (req, res) => {
  try {
    req.session.orderId = req.body.orderId;
    res.redirect("/track-order");
  } catch (err) {
    console.log(err);
    res.sendStatus(200);
  }
};

//track order page load
const loadTrackOrder = async (req, res) => {
  try {
    let { firstName } = await User.findById(req.session.user);
    let { products } = await Cart.findOne({ userId: req.session.user });
    let order = await Order.findById(req.session.orderId);
    let address = await Address.findById(order.addressId);
    let productDetails = [];
    for (let i = 0; i < order.products.length; i++) {
      let { productName, price, productPic1, brandId, _id } =
        await Product.findById(order.products[i].productId);
      let details = {};
      let { brandName } = await Brand.findById(brandId);
      details.name = productName;
      details.price = price;
      details.quantity = order.products[i].quantity;
      details.productPic1 = productPic1;
      details.brand = brandName;
      details._id = _id;
      productDetails.push(details);
    }
    res.render("trackOrder", {
      name: firstName,
      cartNumber: products.length,
      products: productDetails,
      order: order,
      address: address,
    });
  } catch (err) {
    console.log(err);
  }
};

//cancel order
const cancelOrder = async (req, res) => {
  try {
    const { products } = await Order.findOne({
      _id: req.body.orderId,
    });
    const index = products.findIndex(
      (obj) => obj.productId == req.body.productId
    );

    await Order.updateOne(
      {_id: req.body.orderId, 'products.productId': req.body.productId},
      {$set:{'products.$.status': 'Cancelled', 'products.$.reasonForCancel': req.body.reason}}
    )
    await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { stock: products[index].quantity },
    });

    const order = await Order.findById(req.body.orderId);
    let total = 0;
    for (let i = 0; i < products.length; i++) {
      if (order.products[i].status != "Cancelled") {
        let { price } = await Product.findById(products[i].productId);
        total += price * order.products[i].quantity;
      }
    }
    await Order.findByIdAndUpdate(req.body.orderId, {
      $set: { totalCharge: total + total * 0.28, taxCharge: total * 0.28 },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//request return
const returnRequest = async (req, res) => {
  try{
    const {products} = await Order.findById(req.body.orderId);
    const index = products.findIndex(
      (obj) => obj.productId == req.body.productId
    );

    await Order.updateOne(
      {_id: req.body.orderId, 'products.productId': req.body.productId},
      {$set:{'products.$.status': 'Requested for Return', 'products.$.reasonForCancel': req.body.reason}}
    )
    res.sendStatus(200)
  }
  catch(err){
    console.log(err)
    res.sendStatus(500)
  }
}

module.exports = {
  loadCheckout,
  placeOrder,
  loadOrders,
  trackOrder,
  loadTrackOrder,
  cancelOrder,
  returnRequest,
};
