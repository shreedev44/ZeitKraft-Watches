const express = require("express");
const session = require("express-session");
const config = require("../config/config");
const Auth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");
const passport = require("passport");
require("../middlewares/googleAuth");
const userRouter = express();
const multer = require('../config/multer');

userRouter.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
  })
);

userRouter.set("view engine", "ejs");
userRouter.set("views", "./views/user");
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
userRouter.use(passport.initialize());
userRouter.use(passport.session());

//default route
userRouter.get("/", userController.loadHome);

//login route
userRouter.get("/login", Auth.isLogout, userController.loadLogin);

//signup route
userRouter.get("/signup", Auth.isLogout, userController.loadSignup);

//get otp
userRouter.post("/get-otp", Auth.isLogout, userController.getOTP);

//otp verification
userRouter.get("/verifyOtp", Auth.isLogout, userController.loadOTP);

//registration
userRouter.post("/verify-otp", Auth.isLogout, userController.insertUser);

//resend otp
userRouter.get("/resend-otp", Auth.isLogout, userController.resendOTP);

//verification
userRouter.post("/login", userController.verifyUser);

//sign in with google
userRouter.get(
  "/googlesignin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//google callback
userRouter.get(
  "/googlesignin/callback",
  passport.authenticate("google", {
    successRedirect: "/auth-success",
    failureRedirect: "auth-failed",
  })
);

//auth success
userRouter.get('/auth-success', userController.authSuccess)

//home route
userRouter.get("/home", userController.loadHome);

//shop route
userRouter.get("/shop", userController.loadShop);

//product details page
userRouter.get("/product-details", userController.loadProductDetails);

//profile page
userRouter.get('/profile', Auth.isLogin, userController.loadProfile)

//update profile
userRouter.patch('/update-profile', multer.uploadProfile.single('profilePic'), Auth.isLogin, userController.updateProfile);

//change email
userRouter.post('/change-email', Auth.isLogin, userController.changeEmailOtp);

//verify otp
userRouter.post('/email-change-otp', Auth.isLogin, userController.changeEmailOtpVerify);

//change password
userRouter.patch('/change-password', userController.changePassword);

//forgot password load
userRouter.get('/forgot-password', Auth.isLogout, userController.loadForgotPassword)

//forgot password email
userRouter.post('/forgot-password', Auth.isLogout, userController.sendPasswordLink);

//reset Password load
userRouter.get('/reset-password', Auth.isLogout, userController.loadResetPassword);

//reset password
userRouter.post('/reset-password', Auth.isLogout, userController.resetPassword);

//address page load
userRouter.get('/addresses', Auth.isLogin, userController.loadAddresses);

//add address
userRouter.post('/add-address', Auth.isLogin, userController.addAddress);

//delete address
userRouter.delete('/delete-address', Auth.isLogin, userController.deleteAddress);

//logout
userRouter.get("/logout", userController.logout);

module.exports = userRouter;
