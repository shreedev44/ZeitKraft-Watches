const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Address = require("../models/addressModel");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "../variables.env" });
const config = require("../config/config");
const { ObjectId } = require("mongoose").Types;

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

//user profile page
const loadProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);
    res.render("profilePage", {
      name: user.firstName,
      user: user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//update profile
const updateProfile = async (req, res) => {
  try {
    const oldProfile = await User.findById(req.query.userId);
    const oldImage = oldProfile.profilePic;

    let body = {};
    if (req.body.firstName) {
      body.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
      body.lastName = req.body.lastName;
    }
    if (req.body.phone) {
      body.phone = req.body.phone;
    }
    if (req.file) {
      body.profilePic = req.file.filename;
    }
    await User.findByIdAndUpdate(req.query.userId, body);
    if (oldImage && req.file) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "profile",
        oldImage
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log("Error deleting old image:", err);
        }
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//otp for change email
const changeEmailOtp = async (req, res) => {
  try {
    const newEmail = req.body.email;
    req.session.email = newEmail;
    const user = await User.findOne({ email: newEmail });
    if (!user) {
      const otp = otpGenerator();
      req.session.otp = otp;
      let mailOptions = {
        from: "nm6484670@gmail.com",
        to: req.body.email,
        subject: "Your One-Time Password",
        text: `Your one-time password is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//verify otp
const changeEmailOtpVerify = async (req, res) => {
  try {
    if (req.session.otp == req.body.otp) {
      await User.findByIdAndUpdate(req.query.userId, {
        email: req.session.email,
      });
      delete req.session.otp;
      delete req.session.email;
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    const passwordMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (passwordMatch) {
      const hashedPassword = await SecurePassword(req.body.password);
      await User.findByIdAndUpdate(req.query.userId, {
        password: hashedPassword,
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//forgot password load
const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (err) {
    console.log(err.message);
  }
};

//send email with link
const sendPasswordLink = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      req.session.token = config.passwordToken;
      req.session.email = req.body.email;
      let mailOptions = {
        from: "nm6484670@gmail.com",
        to: req.body.email,
        subject: "Your Password Reset Link",
        text: `Click this link to reset your password: http://localhost:3000/reset-password?token=${req.session.token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err.message);
  }
};

//reset password load
const loadResetPassword = async (req, res) => {
  try {
    if (req.query.token == req.session.token && req.query.token != undefined) {
      console.log(req.query.token);
      console.log(req.session.token);
      res.render("resetPassword", { userId: req.session.email });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const hashedPassword = await SecurePassword(req.body.password);
    await User.updateOne(
      { email: req.body.email },
      { password: hashedPassword }
    );
    delete req.session.token;
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//address page load
const loadAddresses = async (req, res) => {
  try {
    const { Address } = await User.findById(req.session.user);
    let user;
    if (Address.length != 0) {
      user = await User.aggregate([
        {
          $match: { _id: new ObjectId(req.session.user) },
        },
        {
          $lookup: {
            from: "address",
            localField: "Address",
            foreignField: "_id",
            as: "addresses",
          },
        },
        { $unwind: "$addresses" },
        { $match: { "addresses.delete": false } },
        {
          $group: {
            _id: "$_id",
            firstName: { $first: "$firstName" },
            lastName: { $first: "$lastName" },
            phone: { $first: "$phone" },
            addresses: { $push: "$addresses" },
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            phone: 1,
            addresses: 1,
          },
        },
      ]);
      user = user[0];
    } else {
      user = await User.findById(req.session.user);
      user.addresses = [];
    }
    res.render("addressPage", { name: user.firstName, user: user });
  } catch (err) {
    console.log(err.message);
  }
};

//add address
const addAddress = async (req, res) => {
  try {
    const address = new Address({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      state: req.body.state,
      streetAddress: req.body.streetAddress,
      city: req.body.city,
      pinCode: req.body.pinCode,
      phone: req.body.phone,
    });
    const savedAddress = await address.save();
    await User.findByIdAndUpdate(req.session.user, {
      $push: { Address: savedAddress._id },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//fetch Address details
const fetchAddress = async (req, res) => {
  try {
    const currentAddress = await Address.findById(req.query.addressId);
    res.status(200).json(currentAddress);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//edit address
const editAddress = async (req, res) => {
  try {
    await Address.findByIdAndUpdate(req.query.addressId, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//delete address
const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndUpdate(req.query.addressId, { delete: true });
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadProfile,
  updateProfile,
  changeEmailOtp,
  changeEmailOtpVerify,
  changePassword,
  loadForgotPassword,
  sendPasswordLink,
  loadResetPassword,
  resetPassword,
  loadAddresses,
  addAddress,
  fetchAddress,
  editAddress,
  deleteAddress,
};
