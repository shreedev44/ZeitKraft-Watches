const express = require("express");
const session = require("express-session");
const config = require("../config/config");
const Auth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");
const profileController = require("../controllers/profileController");
const orderController = require("../controllers/orderController");
const passport = require("passport");
require("../middlewares/googleAuth");
const userRouter = express();
const multer = require("../config/multer");

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
    failureRedirect: "/auth-failed",
  })
);

//auth success
userRouter.get("/auth-success", userController.authSuccess);

//auth failed
userRouter.get("/auth-failed", userController.authFailed);

//home route
userRouter.get("/home", userController.loadHome);

//shop route
userRouter.get("/shop", userController.loadShop);

//product details page
userRouter.get("/product-details", userController.loadProductDetails);

//profile page
userRouter.get("/profile", Auth.isLogin, profileController.loadProfile);

//update profile
userRouter.patch(
  "/update-profile",
  multer.uploadProfile.single("profilePic"),
  Auth.isLogin,
  profileController.updateProfile
);

//change email
userRouter.post(
  "/change-email",
  Auth.isLogin,
  profileController.changeEmailOtp
);

//verify otp
userRouter.post(
  "/email-change-otp",
  Auth.isLogin,
  profileController.changeEmailOtpVerify
);

//change password
userRouter.patch("/change-password", profileController.changePassword);

//forgot password load
userRouter.get(
  "/forgot-password",
  Auth.isLogout,
  profileController.loadForgotPassword
);

//forgot password email
userRouter.post(
  "/forgot-password",
  Auth.isLogout,
  profileController.sendPasswordLink
);

//reset Password load
userRouter.get(
  "/reset-password",
  Auth.isLogout,
  profileController.loadResetPassword
);

//reset password
userRouter.post(
  "/reset-password",
  Auth.isLogout,
  profileController.resetPassword
);

//address page load
userRouter.get("/addresses", Auth.isLogin, profileController.loadAddresses);

//add address
userRouter.post("/add-address", Auth.isLogin, profileController.addAddress);

//fetch address details
userRouter.get("/edit-address", Auth.isLogin, profileController.fetchAddress);

//edit Address
userRouter.patch("/edit-address", Auth.isLogin, profileController.editAddress);

//delete address
userRouter.delete(
  "/delete-address",
  Auth.isLogin,
  profileController.deleteAddress
);

//load Cart page
userRouter.get("/shopping-cart", Auth.isLogin, userController.loadCart);

//add to cart
userRouter.post("/add-to-cart", Auth.isLogin, userController.addToCart);

//remove from cart
userRouter.delete(
  "/remove-from-cart",
  Auth.isLogin,
  userController.removeFromCart
);

//update product quantity
userRouter.post(
  "/update-quantity",
  Auth.isLogin,
  userController.updateQuantity
);

//load checkout page
userRouter.get("/checkout", Auth.isLogin, orderController.loadCheckout);

//apply coupon
userRouter.post("/apply-coupon", Auth.isLogin, orderController.applyCoupon);

//fetch total amount of the order
userRouter.post(
  "/fetch-amount",
  Auth.isLogin,
  orderController.fetchTotalAmount
);

//placing order
userRouter.post("/place-order", Auth.isLogin, orderController.placeOrder);

//load orders page
userRouter.get("/orders", Auth.isLogin, orderController.loadOrders);

//track order page
userRouter.post("/track-order", Auth.isLogin, orderController.trackOrder);

//load track order page
userRouter.get("/track-order", Auth.isLogin, orderController.loadTrackOrder);

//fetch data for invoice data
userRouter.get(
  "/fetch-invoice-data",
  Auth.isLogin,
  orderController.fetchInvoiceData
);

//cancel order
userRouter.patch("/cancel-order", Auth.isLogin, orderController.cancelOrder);

//return request
userRouter.patch(
  "/request-order-return",
  Auth.isLogin,
  orderController.returnRequest
);

//load wishlist page
userRouter.get("/wishlist", Auth.isLogin, userController.loadWishlist);

//add products to wishlist
userRouter.post("/add-to-wishlist", Auth.isLogin, userController.addToWishlist);

//remove products from wishlist
userRouter.post(
  "/remove-from-wishlist",
  Auth.isLogin,
  userController.removeFromWishlist
);

//loading wallet page
userRouter.get("/wallet", Auth.isLogin, userController.loadWallet);

//create order for adding money to wallet
userRouter.post("/create-order", Auth.isLogin, userController.createOrder);

//adding money to wallet
userRouter.post("/add-money", Auth.isLogin, userController.addMoney);

//load Coupon page
userRouter.get("/coupons", userController.loadCoupons);

//load categories page
userRouter.get("/categories", userController.loadCategories);

//load brands page
userRouter.get("/brands", userController.loadBrands);

//load about page
userRouter.get("/about", userController.loadAbout);

//load contact page
userRouter.get("/contact", userController.loadContact);

//generate referral code
userRouter.get(
  "/generate-referral-code",
  Auth.isLogin,
  userController.generateReferral
);

//logout
userRouter.get("/logout", userController.logout);

//404 page not found
userRouter.get("*", userController.loadErrorPage);

module.exports = userRouter;
