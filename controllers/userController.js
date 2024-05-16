const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../variables.env" });

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
    user: "nm6484670@gmail.com",
    pass: "fvpv axcs gzzo kcvp",
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
        from: "nm6484670@gmail.com",
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
      from: "nm6484670@gmail.com",
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
        res.status(200).redirect("/login");
      } else {
        res.redirect("/signup");
      }
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
  }
};

//authentication success
const authSuccess = async (req, res) => {
  try {
    const user = await User.find({ email: req.user.email });
    if (user.length > 0) {
      req.session.user = user[0]._id;
      res.redirect("/home");
    } else {
      const user = new User({
        firstName: req.user.given_name,
        lastName: req.user.family_name,
        email: req.user.email,
      });

      const userData = await user.save();
      if (userData) {
        req.session.user = userData._id;
        res.redirect("/home");
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
    const products = await Product.aggregate([
      { $match: { delete: false } },
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

    if (req.session.user) {
      const { firstName } = await User.findById(req.session.user);
      res.render("userHome", {
        name: firstName,
        brands: brands,
        categories: categories,
        products: products,
        webDetails: webDetails,
      });
    } else {
      res.render("userHome", {
        name: "",
        brands: brands,
        categories: categories,
        products: products,
        webDetails: webDetails,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//shop page load
const loadShop = async (req, res) => {
  try {
    const productsPerPage = 6;
    let currentPage = req.query.productPage ? Number(req.query.productPage) : 1;
    let totalProducts = await Product.countDocuments();
    let totalPages = Math.ceil(totalProducts / productsPerPage);

    const products = await Product.aggregate([
      { $match: { delete: false } },
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
      { $skip: (currentPage - 1) * productsPerPage },
      { $limit: productsPerPage },
    ]);
    const user = await User.findById(req.session.user);
    let name = "";
    if (user) {
      name = user.firstName;
    }
    res.render("shop", {
      name: name,
      products: products,
      pageNumber: currentPage,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//product details page
const loadProductDetails = async (req, res) => {
  try {
    let product = await Product.findById(req.query.productId);
    const categoryId = product.categoryId;
    const brandId = product.brandId;
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

    const products = await Product.aggregate([
      {
        $match: { delete: false },
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
    ]);
    const user = await User.findById(req.session.user);
    let name = "";
    if (user) {
      name = user.firstName;
    }
    res.render("productDetails", {
      name: name,
      product: product,
      products: products,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//load cart page
const loadCart = async (req, res) => {
  try{
    const { firstName } = await User.findById(req.session.user)
    res.render('cart', {name: firstName});
  }
  catch(err) {
    console.log(err.message);
  }
}

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
  logout,
};
