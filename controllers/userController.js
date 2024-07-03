const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Wallet = require("../models/walletModel");
const Wishlist = require("../models/wishlistModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const btoa = require("btoa");
const nodemailer = require("nodemailer");

//Password hashing
const SecurePassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (err) {
    console.log(err.message);
  }
};

//OTP generator
const otpGenerator = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS,
  },
});

//sign up page load
const loadSignup = async (req, res) => {
  try {
    let user = "";
    user += req.query.userExists;
    res.render("userSignup", { userExists: user });
  } catch (err) {
    console.log(err.message);
  }
};

//login page load
const loadLogin = async (req, res) => {
  try {
    res.render("userLogin");
  } catch (err) {
    console.log(err.message);
  }
};

//get OTP
const getOTP = async (req, res) => {
  try {
    const isExisting = await User.findOne({ email: req.body.email });
    if (!isExisting) {
      const otp = otpGenerator();
      req.session.otp = otp;
      req.session.body = req.body;

      let mailOptions = {
        from: process.env.USER_EMAIL,
        to: req.body.email,
        subject: "Your One-Time Password",
        text: `Your one-time password is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.redirect("/verifyOtp");
    } else {
      res.redirect("/signup?userExists=true");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//load otp page
const loadOTP = async (req, res) => {
  try {
    const body = req.session.body;
    res.render("userOTP", { email: body.email });
  } catch (err) {
    console.log(err.message);
  }
};

//resend otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.session.body;
    const otp = otpGenerator();
    req.session.otp = otp;
    let mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your One-Time Password",
      text: `Your one-time password is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.sendStatus(500);
      } else {
        console.log("Email sent: " + info.response);
        res.sendStatus(200);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

//Registration
const insertUser = async (req, res) => {
  try {
    const otp = req.body.otp;
    const data = req.session.body;
    if (otp == req.session.otp) {
      const password = await SecurePassword(data.password);
      const user = new User({
        firstName: data.fname,
        lastName: data.lname,
        email: data.email,
        password: password,
      });

      const userData = await user.save();
      if (userData) {
        const cart = new Cart({
          userId: userData._id,
          products: [],
        });
        const wishlist = new Wishlist({
          userId: userData._id,
          products: [],
        });
        const wallet = new Wallet({
          userId: userData._id,
          balance: 0,
        });
        const cartData = await cart.save();
        const wishlistData = await wishlist.save();
        const walletData = await wallet.save();
        if (cartData && wishlistData && walletData) {
          if (data.referralCode) {
            const user = await User.findOne({
              referralCode: data.referralCode.toString(),
            });
            if (user) {
              const firstTransaction = {
                amount: 100,
                type: "Credit",
                date: new Date(),
                description: `Referral bonus`,
              };
              const secondTransaction = {
                amount: 50,
                type: "Credit",
                date: new Date(),
                description: `Referral bonus`,
              };
              await Wallet.updateOne(
                { userId: user._id },
                {
                  $inc: { balance: 100 },
                  $push: {
                    transactionHistory: {
                      $each: [firstTransaction],
                      $position: 0,
                    },
                  },
                }
              );
              await Wallet.updateOne(
                { userId: userData._id },
                {
                  $inc: { balance: 50 },
                  $push: {
                    transactionHistory: {
                      $each: [secondTransaction],
                      $position: 0,
                    },
                  },
                }
              );
            }
          }
          res.status(200).redirect("/login");
        }
      } else {
        res.redirect("/signup");
      }
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err);
  }
};

//authentication success
const authSuccess = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      if(user.isBlocked){
        res.redirect('/login');
        return;
      }
      req.session.user = user._id;
      res.redirect("/home");
    } else {
      const user = new User({
        firstName: req.user.given_name,
        lastName: req.user.family_name,
        email: req.user.email,
      });

      const userData = await user.save();
      if (userData) {
        const cart = new Cart({
          userId: userData._id,
          products: [],
        });
        const wishlist = new Wishlist({
          userId: userData._id,
          products: [],
        });
        const wallet = new Wallet({
          userId: userData._id,
          balance: 0,
        });
        const cartData = await cart.save();
        const wishlistData = await wishlist.save();
        const walletData = await wallet.save();
        if (cartData && wishlistData && walletData) {
          if (data.referralCode) {
            const user = await User.findOne({
              referralCode: data.referralCode.toString(),
            });
            if (user) {
              const firstTransaction = {
                amount: 100,
                type: "Credit",
                date: new Date(),
                description: `Referral bonus`,
              };
              const secondTransaction = {
                amount: 50,
                type: "Credit",
                date: new Date(),
                description: `Referral bonus`,
              };
              await Wallet.updateOne(
                { userId: user._id },
                {
                  $inc: { balance: 100 },
                  $push: {
                    transactionHistory: {
                      $each: [firstTransaction],
                      $position: 0,
                    },
                  },
                }
              );
              await Wallet.updateOne(
                { userId: userData._id },
                {
                  $inc: { balance: 50 },
                  $push: {
                    transactionHistory: {
                      $each: [secondTransaction],
                      $position: 0,
                    },
                  },
                }
              );
            }
          }
          res.status(200).redirect("/login");
        }
      } else {
        res.redirect("/signup");
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

//auth failed
const authFailed = async (req, res) => {
  try {
    res.redirect("/login");
  } catch (err) {
    console.log(err.message);
  }
};

//verify user
const verifyUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isBlocked) {
        res
          .status(401)
          .json({ message: "You are restricted from this website" });
      } else if (!userData.password) {
        res
          .status(400)
          .json({ message: "Please login with your social account" });
      } else {
        const findPassword = await bcrypt.compare(password, userData.password);
        if (findPassword) {
          req.session.user = userData._id;
          if (req.query.cookie) {
            res
              .status(200)
              .json({ message: `${userData.firstName} ${userData.lastName}` });
          } else {
            res
              .status(200)
              .json({ message: `${userData.firstName} ${userData.lastName}` });
          }
        } else {
          res.status(400).json({ message: "Incorrect Password" });
        }
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//home page load
const loadHome = async (req, res) => {
  try {
    const brands = await Brand.find({ delete: false, listed: true });
    const categories = await Category.find({ delete: false, listed: true });
    let webDetails = [];
    webDetails[0] = await Product.find({ delete: false }).countDocuments();
    webDetails[1] = await User.find().countDocuments();
    webDetails[2] = await Order.find().countDocuments();
    webDetails[3] = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
    ]);
    webDetails[3] = webDetails[3].length;
    const popularProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "productDetails.brandId",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      {
        $project: {
          _id: 1,
          productDetails: { $arrayElemAt: ["$productDetails", 0] },
          brandDetails: { $arrayElemAt: ["$brandDetails", 0] },
        },
      },
    ]);
    const cart = await Cart.findOne({ userId: req.session.user });

    if (req.session.user) {
      const { firstName } = await User.findById(req.session.user);
      res.render("userHome", {
        name: firstName,
        brands: brands,
        categories: categories,
        products: popularProducts,
        webDetails: webDetails,
        cartNumber: cart.products.length,
      });
    } else {
      res.render("userHome", {
        name: "",
        brands: brands,
        categories: categories,
        products: popularProducts,
        webDetails: webDetails,
        cartNumber: 0,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//shop page load
const loadShop = async (req, res) => {
  try {
    const {
      search,
      categories,
      brands,
      types,
      dialColors,
      strapColors,
      minPrice,
      maxPrice,
      sort,
      page = 1,
    } = req.query;

    let filter = { delete: false, listed: true };
    let sortOption = {};

    if (categories)
      filter["category.categoryName"] = {
        $in: Array.isArray(categories) ? categories : [categories],
      };
    if (brands)
      filter["brand.brandName"] = {
        $in: Array.isArray(brands) ? brands : [brands],
      };
    if (types) filter.type = { $in: Array.isArray(types) ? types : [types] };
    if (dialColors)
      filter.dialColor = {
        $in: Array.isArray(dialColors) ? dialColors : [dialColors],
      };
    if (strapColors)
      filter.strapColor = {
        $in: Array.isArray(strapColors) ? strapColors : [strapColors],
      };
    if (minPrice)
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice)
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (search) {
      const keywords = search.split(" ").map((keyword) => ({
        $or: [
          { productName: { $regex: keyword, $options: "i" } },
          { "brand.brandName": { $regex: keyword, $options: "i" } },
          { "category.categoryName": { $regex: keyword, $options: "i" } },
          { type: { $regex: keyword, $options: "i" } },
          { modelNumber: { $regex: keyword, $options: "i" } },
          { dialColor: { $regex: keyword, $options: "i" } },
          { strapColor: { $regex: keyword, $options: "i" } },
        ],
      }));
      if (filter.$and) {
        filter.$and.push(...keywords);
      } else {
        filter.$and = keywords;
      }
    }

    if (sort) {
      const [sortField, sortOrder] = sort.split("-");
      sortOption[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOption.addedDate = -1;
    }

    const perPage = 6;
    const skip = (page - 1) * perPage;

    const products = await Product.aggregate([
      { $match: { delete: false, listed: true } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $match: filter },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: perPage },
    ]);
    const user = await User.findById(req.session.user);
    let name = "";
    if (user) {
      name = user.firstName;
    }

    const cart = await Cart.findOne({ userId: req.session.user });
    const categoriesList = await Category.find({ delete: false, listed: true });
    const brandsList = await Brand.find({ delete: false, listed: true });
    const dialColorsList = await Product.distinct("dialColor");
    const strapColorsList = await Product.distinct("strapColor");
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / perPage);

    res.render("shop", {
      name: name,
      products: products,
      pageNumber: page,
      totalPages: totalPages,
      brands: brandsList,
      categories: categoriesList,
      dialColors: dialColorsList,
      strapColors: strapColorsList,
      cartNumber: cart ? cart.products.length : 0,
      search: search,
    });
  } catch (err) {
    console.log(err);
  }
};

//product details page
const loadProductDetails = async (req, res) => {
  try {
    let product = await Product.findById(req.query.productId);
    product = await Product.aggregate([
      { $match: { _id: product._id, delete: false } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
    ]);

    let suggestedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product[0]._id },
          delete: false,
          listed: true,
          $or: [
            { brandId: product[0].brandId },
            { categoryId: product[0].categoryId },
            { type: product[0].type },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$category" },
      { $unwind: "$brand" },
      { $limit: 4 },
    ]);
    const remainingSlots = 4 - suggestedProducts.length;
    if (remainingSlots > 0) {
      const additionalProducts = await Product.aggregate([
        {
          $match: {
            _id: {
              $nin: suggestedProducts.map((p) => p._id).concat([product._id]),
            },
            delete: false,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brandId",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: "$category" },
        { $unwind: "$brand" },
        { $sample: { size: remainingSlots } },
      ]);

      suggestedProducts = suggestedProducts.concat(additionalProducts);
    }
    const user = await User.findById(req.session.user);
    let name = "";
    if (user) {
      name = user.firstName;
    }

    const cart = await Cart.findOne({ userId: req.session.user });
    res.render("productDetails", {
      name: name,
      product: product,
      products: suggestedProducts,
      cartNumber: cart ? cart.products.length : 0,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//load cart page
const loadCart = async (req, res) => {
  try {
    const { firstName } = await User.findById(req.session.user);
    const cart = await Cart.findOne({ userId: req.session.user });
    let productDetails = [];
    for (let i = 0; i < cart.products.length; i++) {
      let product = {};
      let { productName, price, productPic1, brandId, _id, categoryId } =
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
    res.render("cart", {
      name: firstName,
      cart: cart,
      products: productDetails,
      cartNumber: cart.products.length,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//add to cart
const addToCart = async (req, res) => {
  try {
    const productExist = await Cart.findOne({
      "products.productId": req.body.productId,
      userId: req.session.user,
    });
    if (!productExist) {
      await Cart.updateOne(
        {
          userId: req.session.user,
        },
        {
          $addToSet: { products: req.body },
        }
      );
      res.sendStatus(201);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//remove from cart
const removeFromCart = async (req, res) => {
  try {
    await Cart.updateOne(
      { userId: req.session.user },
      { $pull: { products: { productId: req.query.productId } } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//update Quantity
const updateQuantity = async (req, res) => {
  try {
    let quantity = req.body.quantity;
    const { stock } = await Product.findOne({ _id: req.body.productId });
    if (stock >= quantity) {
      await Cart.updateOne(
        { userId: req.session.user, "products.productId": req.body.productId },
        { $set: { "products.$.quantity": req.body.quantity } }
      );
    } else {
      await Cart.updateOne(
        { userId: req.session.user, "products.productId": req.body.productId },
        { $set: { "products.$.quantity": stock } }
      );
      quantity = stock;
    }
    res.status(200).json({ quantity: quantity });
  } catch (err) {
    console.log(err.message);
  }
};

//load wishlist page
const loadWishlist = async (req, res) => {
  try {
    let products = await Wishlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.session.user) } },
      {
        $lookup: {
          from: "products",
          localField: "products",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
      { $unwind: "$productsDetails" },
      {
        $project: {
          productsDetails: 1,
          _id: 0,
        },
      },
    ]);
    products.forEach(async (product) => {
      const { brandName } = await Brand.findById(
        product.productsDetails.brandId
      );
      products[products.indexOf(product)].productsDetails.brand = brandName;
    });
    const { firstName } = await User.findById(req.session.user);
    const cart = await Cart.findOne({ userId: req.session.user });
    res.render("wishlist", {
      name: firstName,
      cartNumber: cart.products.length,
      products: products,
    });
  } catch (err) {
    console.log(err);
  }
};

//adding to wishlist
const addToWishlist = async (req, res) => {
  try {
    const productExist = await Wishlist.findOne({
      products: { $elemMatch: { $eq: req.body.productId } },
    });
    if (!productExist) {
      await Wishlist.updateOne(
        { userId: req.session.user },
        { $addToSet: { products: req.body.productId } }
      );
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//removing from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.updateOne(
      { userId: req.session.user },
      { $pull: { products: req.body.productId } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//load wallet page
const loadWallet = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { firstName, lastName } = await User.findById(req.session.user);
    const { products } = await Cart.findOne({ userId: req.session.user });
    const wallet = await Wallet.findOne({ userId: req.session.user });
    res.render("walletPage", {
      name: firstName,
      lname: lastName,
      cartNumber: products.length,
      wallet: wallet,
      pageNumber: page
    });
  } catch (err) {
    console.log(err);
  }
};

//creating order id for adding money to wallet
const createOrder = async (req, res) => {
  try {
    let amount = Number(req.body.amount);
    amount = amount.toFixed(2);
    amount = amount.replace(".", "");
    const creds = btoa(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
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
    if (response.ok) {
      res.status(200).json({ amount: req.body.amount, orderId: response.id });
    } else {
      res.sendStatus(500);
    }
  } catch (err) {
    console.log(err);
  }
};

//adding money to wallet
const addMoney = async (req, res) => {
  try {
    const transaction = {
      amount: req.body.amount,
      type: "Credit",
      date: new Date(),
      description: "Added through Razorpay",
    };
    await Wallet.updateOne(
      { userId: req.session.user },
      {
        $inc: { balance: Number(req.body.amount) },
        $push: {
          transactionHistory: {
            $each: [transaction],
            $position: 0,
          },
        },
      }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
  }
};

//coupons page load
const loadCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ listed: true });
    const user = await User.findById(req.session.user);
    let name = "";
    let cartNo = 0;
    if (user) {
      name = user.firstName;
      const { products } = await Cart.findOne({ userId: user._id });
      cartNo = products.length;
    }
    res.render("coupons", {
      name: name,
      coupons: coupons,
      cartNumber: cartNo,
    });
  } catch (err) {
    console.log(err);
  }
};

//categories page
const loadCategories = async (req, res) => {
  try {
    const categories = await Category.find({ delete: false, listed: true });
    const user = await User.findById(req.session.user);
    const cart = await Cart.findOne({ userId: req.session.user });
    let firstName = "";
    let cartNumber = 0;
    if (user) {
      firstName = user.firstName;
      cartNumber = cart.products.length;
    }
    res.render("categories", {
      name: firstName,
      cartNumber: cartNumber,
      categories: categories,
    });
  } catch (err) {
    console.log(err);
  }
};

//load brands
const loadBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ delete: false, listed: true });
    const user = await User.findById(req.session.user);
    const cart = await Cart.findOne({ userId: req.session.user });
    let firstName = "";
    let cartNumber = 0;
    if (user) {
      firstName = user.firstName;
      cartNumber = cart.products.length;
    }
    res.render("brands", {
      name: firstName,
      cartNumber: cartNumber,
      brands: brands,
    });
  } catch (err) {
    console.log(err);
  }
};

//404 page not found
const loadErrorPage = async (req, res) => {
  try {
    let firstName = "";
    const user = await User.findById(req.session.user);
    if (user) {
      firstName = user.firstName;
    }
    let cartNumber = 0;
    const cart = await Cart.findOne({ userId: req.session.user });
    if (cart) {
      cartNumber = cart.products.length;
    }
    res.render("errorPage", { name: firstName, cartNumber: cartNumber });
  } catch (err) {
    console.log(err);
  }
};

//about page load
const loadAbout = async (req, res) => {
  try {
    let firstName = "";
    const user = await User.findById(req.session.user);
    if (user) {
      firstName = user.firstName;
    }
    let cartNumber = 0;
    const cart = await Cart.findOne({ userId: req.session.user });
    if (cart) {
      cartNumber = cart.products.length;
    }
    res.render("about", { name: firstName, cartNumber: cartNumber });
  } catch (err) {
    console.log(err);
  }
};

//load contact page
const loadContact = async (req, res) => {
  try {
    let firstName = "";
    const user = await User.findById(req.session.user);
    if (user) {
      firstName = user.firstName;
    }
    let cartNumber = 0;
    const cart = await Cart.findOne({ userId: req.session.user });
    if (cart) {
      cartNumber = cart.products.length;
    }
    res.render("contact", { name: firstName, cartNumber: cartNumber });
  } catch (err) {
    console.log(err);
  }
};

//generate referral link
const generateReferral = async (req, res) => {
  try {
    const { referralCode } = await User.findById(req.session.user);
    res.status(200).json({
      link: `https://zeitkraftwatches.shop/signup?referralCode=${referralCode}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//logout
const logout = async (req, res) => {
  try {
    delete req.session.user;
    res.redirect("/home");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadSignup,
  loadLogin,
  getOTP,
  loadOTP,
  resendOTP,
  insertUser,
  verifyUser,
  authSuccess,
  authFailed,
  loadHome,
  loadShop,
  loadProductDetails,
  loadCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  loadWishlist,
  addToWishlist,
  removeFromWishlist,
  loadWallet,
  createOrder,
  addMoney,
  loadCoupons,
  loadCategories,
  loadErrorPage,
  loadBrands,
  loadAbout,
  loadContact,
  generateReferral,
  logout,
};
