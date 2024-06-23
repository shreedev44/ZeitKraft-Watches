const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Coupon = require("../models/couponModel");
const mongoose = require("mongoose");
const btoa = require("btoa");

function generateOID(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "OID-";
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
        let { productName, price, productPic1, brandId, categoryId, _id } =
          await Product.findById(cart.products[i].productId);
        product.productId = _id;
        product.name = productName;
        product.price = price;
        product.pic = productPic1;
        let brand = await Brand.findById(brandId);
        product.brand = brand;
        let category = await Category.findById(categoryId);
        product.category = category;
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

//apply coupon
const applyCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });
    if (coupon) {
      const order = await Order.findOne({userId: req.session.user, couponId: coupon._id})
      if(order){
        res.sendStatus(401);
        return
      }
      res
        .status(200)
        .json({
          offerPercent: coupon.offerPercent,
          minAmount: coupon.minPurchase,
          maxAmount: coupon.maxRedeem,
        });
    }
    else{
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//fetch total amount for online payment
const fetchTotalAmount = async (req, res) => {
  try {
    const createRazorpayOrder = async (amount) => {
      try {
        amount = amount.toFixed(2);
        amount = amount.replace(".", "");
        const creds = btoa(
          `${process.env.RAZORPAY_KEY_ID}: ${process.env.RAZORPAY_KEY_SECRET}`
        );
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${creds}`,
          },
          body: JSON.stringify({
            amount: amount,
            currency: "INR",
          }),
        });
        return response;
      } catch (err) {
        console.log(err);
      }
    };
    if (req.body.orderType == "cart order") {
      let totalCharge = 0;
      const cart = await Cart.findOne({ userId: req.session.user });
      let validated = true;
      for (let i = 0; i < cart.products.length; i++) {
        const { price, stock, offerPercent, categoryId, brandId } = await Product.findOne({
          _id: cart.products[i].productId,
        });
        if (stock == 0) {
          res
            .status(400)
            .json({ message: "Sorry, the requested product is out of stock" });
          validated = false;
        } else if (stock < cart.products[i].quantity) {
          res.status(400).json({
            message:
              "Sorry, the requested product doesn't have enough stock as you requested",
          });
          validated = false;
        } else {
          let category = await Category.findById(categoryId);
          let brand = await Brand.findById(brandId);
          let offer = 0;
          if(offerPercent){
            offer = offerPercent;
          }
          if(category.offerPercent){
            offer = category.offerPercent > offer ? category.offerPercent : offer;
          }
          if(brand.offerPercent){
            offer = brand.offerPercent > offer ? brand.offerPercent : offer;
          }
          if(offer > 0){
            totalCharge += (price - price * offer / 100) * cart.products[i].quantity;
          }
          else{
            totalCharge += price * cart.products[i].quantity;
          }
        }
      }
      if (validated) {
        totalCharge = totalCharge * 0.28 + 60 + totalCharge;
        const response = await createRazorpayOrder(totalCharge);
        if(req.body.couponCode){
          const coupon = await Coupon.findOne({couponCode: req.body.couponCode});
          if(coupon){
            const order = await Order.findOne({userId: req.session.user, couponId: coupon._id});
            if(order){
              res.status(400).json({message: "Sorry! You can't reuse coupon"});
              return;
            }
            if(totalCharge < coupon.minPurchase){
              res.status(400).json({message: "Sorry something went wrong with the coupon you applied"});
              return;
            }
            if(totalCharge * coupon.offerPercent / 100 > coupon.maxRedeem){
              res.status(400).json({message: "Sorry something went wrong with the coupon you applied"});
              return;
            }
            totalCharge = totalCharge - (totalCharge * coupon.offerPercent / 100);
          }
          else{
            res.status(400).json({message: "Sorry we couldn't find the coupon you applied"});
            return;
          }
        }
        res
          .status(200)
          .json({ totalCharge: totalCharge, orderId: response.id });
      }
    } else if (req.body.orderType == "repay") {
      const order = await Order.findOne({ _id: req.body.orderId });
      let validated = true;
      for (let i = 0; i < order.products.length; i++) {
        const { stock } = await Product.findOne({
          _id: order.products[i].productId,
        });
        if (stock == 0) {
          res
            .status(400)
            .json({ message: "Sorry, the requested product is out of stock" });
          validated = false;
        } else if (stock < order.products[i].quantity) {
          res.status(400).json({
            message:
              "Sorry, the requested product doesn't have enough stock as you requested",
          });
          validated = false;
        }
      }
      if (validated) {
        const response = await createRazorpayOrder(order.totalCharge);
        res.status(200).json({
          totalCharge: order.totalCharge,
          razorpayOrderId: response.id,
          orderId: order._id,
        });
      }
    } else {
      const { price, stock, categoryId, brandId, offerPercent } = await Product.findById(req.body.productId);
      if (stock == 0) {
        res
          .status(400)
          .json({ message: "Sorry, the requested product is out of stock" });
      } else {
        let offer = 0;
        let category = await Category.findById(categoryId);
        let brand = await Brand.findById(brandId);
        if(offerPercent){
          offer = offerPercent;
        }
        if(category.offerPercent){
          offer = category.offerPercent > offer ? category.offerPercent : offer;
        }
        if(brand.offerPercent){
          offer = brand.offerPercent > offer ? brand.offerPercent : offer;
        }
        if(offer > 0){
          price = price - price * offer / 100;
        }
        let totalCharge = price * 0.28 + 60 + price;
        if(req.body.couponCode){
          const coupon = await Coupon.findOne({couponCode: req.body.couponCode});
          if(coupon){
            const order = await Order.findOne({userId: req.session.user, couponId: coupon._id});
            if(order){
              res.status(400).json({message: "Sorry! You can't reuse coupon"});
              return;
            }
            if(totalCharge < coupon.minPurchase){
              res.status(400).json({message: "Sorry something went wrong with the coupon you applied"});
              return;
            }
            if(totalCharge * coupon.offerPercent / 100 > coupon.maxRedeem){
              res.status(400).json({message: "Sorry something went wrong with the coupon you applied"});
              return;
            }
            totalCharge = totalCharge - (totalCharge * coupon.offerPercent / 100);
          }
          else{
            res.status(400).json({message: "Sorry we couldn't find the coupon you applied"});
            return;
          }
        }
        const response = await createRazorpayOrder(totalCharge);
        res
          .status(200)
          .json({ totalCharge: totalCharge, orderId: response.id });
      }
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//placing order
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
          let offerDiscount = 0;
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
              let offer = 0;
              let category = await Category.findById(product.categoryId);
              let brand = await Brand.findById(product.brandId);
              if(product.offerPercent){
                offer = product.offerPercent;
              }
              if(category.offerPercent){
                offer = category.offerPercent > offer ? category.offerPercent : offer;
              }
              if(brand.offerPercent){
                offer = brand.offerPercent > offer ? brand.offerPercent : offer;
              }
              if(offer > 0){
                product.price = product.price - product.price * offer / 100;
                offerDiscount += product.price * offer / 100;
              }
              let currentDate = new Date();
              let last = new Date();
              currentDate.setDate(currentDate.getDate() + 7);
              products.push({
                productId: new mongoose.Types.ObjectId(product._id),
                quantity: Number(cart.products[i].quantity),
                status: payment == "Razorpay" ? "Payment Pending" : "Placed",
                deliveryDate: currentDate,
                lastUpdated: last,
                subTotal: product.price * cart.products[i].quantity
              });
              productsTotal += product.price * cart.products[i].quantity;
            }
          }
          for (let i = 0; i < cart.products.length; i++) {
            await Product.findByIdAndUpdate(cart.products[i].productId, {
              $inc: { stock: -1 * cart.products[i].quantity },
            });
          }
          body.OID = generateOID(16);
          body.products = products;
          body.taxCharge = productsTotal * 0.28;
          body.totalCharge = productsTotal + body.taxCharge + 60;
          if(offerDiscount > 0){
            body.offerDiscount = offerDiscount;
          }
          if (body.totalCharge < 1000 && payment == "Cash on Delivery") {
            res.status(400).json({
              message: "Sorry! minimum cash on delivery requirement is ₹ 1000",
            });
            return;
          }
          if(req.body.couponCode){
            const coupon = await Coupon.findOne({couponCode: req.body.couponCode});
            if(coupon){
              body.discountAmount = body.totalCharge * coupon.offerPercent / 100;
              body.totalCharge = body.totalCharge - body.discountAmount;
              body.couponId = coupon._id;
              body.couponMinPurchase = coupon.minPurchase;
              body.couponMaxRedeem = coupon.maxRedeem;
              body.couponOfferPercent = coupon.offerPercent;
            }
            else{
              res.status(400).json({message: "Sorry! something went wrong with the coupon you applied"});
              return;
            }
          }
          if (payment == "ZEITKRAFT Wallet") {
            const { balance } = await Wallet.findOne({
              userId: req.session.user,
            });
            if (balance < body.totalCharge) {
              res.status(402).json({
                message:
                  "Sorry! You don't have enough balance in your wallet make this payment. Try another way",
              });
              return;
            } else {
              const transaction = {
                amount: body.totalCharge,
                type: "Debit",
                date: new Date(),
                description: "Product Purchased",
              };
              await Wallet.updateOne(
                { userId: req.session.user },
                {
                  $inc: { balance: -1 * body.totalCharge },
                  $push: {
                    transactionHistory: {
                      $each: [transaction],
                      $position: 0,
                    },
                  },
                }
              );
            }
          }

          await Cart.findByIdAndUpdate(cart._id, { products: [] });
        } else {
          const product = await Product.findById(req.body.productId);
          if (product.stock == 0) {
            res.status(400).json({
              message: "Sorry, the requested product is out of stock",
            });
            return;
          }
          let currentDate = new Date();
          let last = new Date();
          currentDate.setDate(currentDate.getDate() + 7);
          let offer = 0;
          let category = await Category.findById(product.categoryId);
          let brand = await Brand.findById(product.brandId);
          if(product.offerPercent){
            offer = product.offerPercent;
          }
          if(category.offerPercent){
            offer = category.offerPercent > offer ? category.offerPercent : offer;
          }
          if(brand.offerPercent){
            offer = brand.offerPercent > offer ? brand.offerPercent : offer;
          }
          let offerDiscount = 0;
          if(offer > 0){
            offerDiscount = product.price * offer / 100;
            product.price = product.price - product.price * offer / 100;
          }
          body.products = [
            {
              productId: new mongoose.Types.ObjectId(product._id),
              quantity: 1,
              status: payment == "Razorpay" ? "Payment Pending" : "Placed",
              deliveryDate: currentDate,
              lastUpdated: last,
              subTotal: product.price
            },
          ];
          body.OID = generateOID(16);
          body.taxCharge = product.price * 0.28;
          body.totalCharge = product.price + body.taxCharge + 60;
          if(offer > 0){
            body.offerDiscount = offerDiscount;
          }
          if(req.body.couponCode){
            const coupon = await Coupon.findOne({couponCode: req.body.couponCode});
            if(coupon){
              body.discountAmount = body.totalCharge * coupon.offerPercent / 100;
              body.totalCharge = body.totalCharge - body.discountAmount;
              body.couponId = coupon._id;
              body.couponMinPurchase = coupon.minPurchase;
              body.couponMaxRedeem = coupon.maxRedeem;
              body.couponOfferPercent = coupon.offerPercent;
            }
            else{
              res.status(400).json({message: "Sorry! something went wrong with the coupon you applied"});
              return;
            }
          }
          if (payment == "ZEITKRAFT Wallet") {
            const { balance } = await Wallet.findOne({
              userId: req.session.user,
            });
            if (balance < body.totalCharge) {
              res.status(402).json({
                message:
                  "Sorry! You don't have enough balance in your wallet make this payment. Try another way",
              });
              return;
            } else {
              console.log("hello");
              const transaction = {
                amount: body.totalCharge,
                type: "Debit",
                date: new Date(),
                description: "Product Purchased",
              };
              await Wallet.updateOne(
                { userId: req.session.user },
                {
                  $inc: { balance: -1 * body.totalCharge },
                  $push: {
                    transactionHistory: {
                      $each: [transaction],
                      $position: 0,
                    },
                  },
                }
              );
            }
          }
          await Product.findByIdAndUpdate(product._id, {
            $inc: { stock: -1 },
          });
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
    } else if (req.body.paymentMethod == "payment_wallet") {
      placeOrder("ZEITKRAFT Wallet");
    } else if (req.body.paymentMethod == "payment_razorpay") {
      placeOrder("Razorpay");
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
    let orders = await Order.find({ userId: req.session.user }).sort({
      orderDate: -1,
    });
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
    if (req.body.payment == "success") {
      await Order.updateMany(
        { _id: req.body.orderId },
        {
          $set: { "products.$[].status": "Placed" },
        }
      );
    } else if (req.body.payment == "failed") {
      const { products } = await Order.findById(req.body.orderId);
      for (let i = 0; i < products.length; i++) {
        await Product.updateOne(
          { _id: products[i].productId },
          { $inc: { stock: products[i].quantity } }
        );
      }
    }
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
    const order = await Order.findOne({ _id: req.body.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productIndex = order.products.findIndex(
      (obj) => obj.productId == req.body.productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in order' });
    }

    if (['Cancelled', 'Returned'].includes(order.products[productIndex].status)) {
      return res.status(400).json({ message: 'Product is already cancelled or returned' });
    }

    order.products[productIndex].status = 'Cancelled';
    order.products[productIndex].reasonForCancel = req.body.reason;
    order.products[productIndex].complete = true;
    order.products[productIndex].lastUpdated = new Date();

    await order.save();

    await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { stock: order.products[productIndex].quantity },
    });

    let remainingTotal = 0;
    for (let i = 0; i < order.products.length; i++) {
      if (order.products[i].status !== 'Cancelled') {
        remainingTotal += order.products[i].subTotal;
      }
    }

    const newTaxCharge = remainingTotal * 0.28;

    const productsCount = order.products.filter(
      (p) => !['Cancelled', 'Returned'].includes(p.status)
    ).length;
    const discountPerProduct = order.discountAmount ? order.discountAmount / (productsCount + 1) : 0;
    const newDiscountAmount = discountPerProduct * productsCount;

    const deliveryCharge = remainingTotal > 0 ? 60 : 0;
    const newTotalCharge = remainingTotal + newTaxCharge + deliveryCharge - newDiscountAmount;

    let refundAmount = 0;
    if (order.paymentMethod !== 'Cash on Delivery') {
      const originalCharge = order.totalCharge;
      refundAmount = originalCharge - newTotalCharge;

      const transaction = {
        amount: refundAmount,
        type: 'Credit',
        date: new Date(),
        description: `Order Refund of ${order.OID}`,
      };

      await Wallet.updateOne(
        { userId: req.session.user },
        {
          $inc: { balance: refundAmount },
          $push: {
            transactionHistory: {
              $each: [transaction],
              $position: 0,
            },
          },
        }
      );
    }

    if (remainingTotal < order.minPurchase || newDiscountAmount > order.maxRedeem) {
      return res.status(400).json({
        message: 'Cancelling this product will make the order ineligible for the applied coupon. Please contact support for further assistance.',
      });
    }

    await Order.findByIdAndUpdate(req.body.orderId, {
      $set: {
        totalCharge: newTotalCharge,
        taxCharge: newTaxCharge,
        deliveryCharge: deliveryCharge,
        discountAmount: newDiscountAmount,
      },
    });

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};


//request return
const returnRequest = async (req, res) => {
  try {
    await Order.updateOne(
      { _id: req.body.orderId, "products.productId": req.body.productId },
      {
        $set: {
          "products.$.status": "Requested for Return",
          "products.$.reasonForReturn": req.body.reason,
          "products.$.lastUpdated": new Date(),
        },
      }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

module.exports = {
  loadCheckout,
  applyCoupon,
  fetchTotalAmount,
  placeOrder,
  loadOrders,
  trackOrder,
  loadTrackOrder,
  cancelOrder,
  returnRequest,
};
