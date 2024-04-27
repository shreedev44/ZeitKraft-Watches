const express = require("express");
const session = require("express-session");
const config = require("../config/config");
const Auth = require("../middlewares/userAuth");
const userController = require("../controllers/userController");
const passport = require("passport");
require("../middlewares/googleAuth");
const userRouter = express();

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

//logout
userRouter.get("/logout", userController.logout);

module.exports = userRouter;
