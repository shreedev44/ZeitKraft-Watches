const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Address = require("../models/addressModel");

//login page load
const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (err) {
    console.log(err.message);
  }
};

//verify admin
const verifyAdmin = async (req, res) => {
  try {
    const admin = await Admin.find({ email: req.body.email });
    if (admin.length > 0) {
      if (admin[0].password == req.body.password) {
        req.session.admin = admin[0].name;
        res.sendStatus(200);
      } else {
        res.status(400).json({ error: "Incorrect Password" });
      }
    } else {
      res.status(400).json({ error: "Admin not found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//dashboard page load
const loadDashboard = async (req, res) => {
  try {
    res.render("adminDashboard", { name: req.session.admin });
  } catch (err) {
    console.log(err.message);
  }
};

//users page load
const loadUsers = async (req, res) => {
  try {
    let search = req.query.search;
    let query = {};
    if (search) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query);
    res.render("users", {
      users: users,
      search: search,
      name: req.session.admin,
    });
  } catch (err) {
    console.log(err.message);
  }
};

//block or unblock user
const blockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.query.userId, req.body);
    if (req.session.user && req.query.userId == req.session.user) {
      delete req.session.user;
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

//orders page load
const loadOrders = async (req, res) => {
  try {
    let search = req.query.search;
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { OID: { $regex: search, $options: "i" } },
        ],
      };
    }
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          OID: 1,
          userId: 1,
          totalCharge: 1,
          paymentMethod: 1,
          orderDate: 1,
          firstName: "$user.firstName",
          lastName: "$user.lastName",
        },
      },
      {
        $match: query,
      },
    ]);
    res.render("orders", {
      orders: orders,
      name: req.session.admin,
      search: search,
    });
  } catch (err) {
    console.log(err);
  }
};

//load order details page
const loadOrderDetails = async (req, res) => {
  try {
    let order = await Order.findById(req.query.orderId);
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
    res.render("orderDetails", {
      name: req.session.admin,
      products: productDetails,
      order: order,
      address: address,
    });
  } catch (err) {
    console.log(err);
  }
};

//update status
const updateStatus = async (req, res) => {
  try {
    let updateStatus = { $set: { "products.$.status": req.body.status } };
    if (req.body.status == "approved") {
      await Product.findByIdAndUpdate(req.body.productId, {
        $inc: { stock: req.body.quantity },
      });
      updateStatus = {
        $set: { "products.$.status": "Returned", "products.$.complete": true },
      };
    } else if (req.body.status == "rejected") {
      updateStatus = {
        $set: { "products.$.status": "Delivered", "products.$.complete": true },
      };
    }
    await Order.updateOne(
      { _id: req.body.orderId, "products.productId": req.body.productId },
      updateStatus
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
  }
};

//logout
const logout = async (req, res) => {
  try {
    delete req.session.admin;
    res.redirect("/admin");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadLogin,
  verifyAdmin,
  loadDashboard,
  loadUsers,
  blockUser,
  loadOrders,
  loadOrderDetails,
  updateStatus,
  logout,
};
