const User = require("../models/userModel");

// checking if logged in or not
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//checking if logged out or not
const isLogout = async (req, res, next) => {
  try {
    if (!req.session.user) {
      next();
    } else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//checking if user is blocked or not
const isBlock = async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById({ _id: req.session.user });
      if (user.isBlocked) {
        res.status(403).render("");
      } else {
        next();
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  isBlock,
};
