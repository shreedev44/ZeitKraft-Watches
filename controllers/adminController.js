const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Address = require("../models/addressModel");
const Wallet = require("../models/walletModel");

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
      {
        $sort: { orderDate: -1 },
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
    const { userId } = await Order.findById(req.body.orderId);
    let updateStatus = {
      $set: {
        "products.$.status": req.body.status,
        "products.$.lastUpdated": new Date(),
      },
    };
    if (req.body.status == "approved") {
      await Product.findByIdAndUpdate(req.body.productId, {
        $inc: { stock: req.body.quantity },
      });
      const { price } = await Product.findById(req.body.productId);
      let refundPrice = price * Number(req.body.quantity);
      refundPrice = refundPrice + refundPrice * 0.28;
      const transaction = {
        amount: refundPrice,
        type: "Credit",
        date: new Date(),
        description: "Order Refund",
      };
      await Wallet.updateOne(
        { userId: userId },
        {
          $inc: { balance: refundPrice },
          $push: {
            transactionHistory: {
              $each: [transaction],
              $position: 0,
            },
          },
        }
      );
      updateStatus = {
        $set: {
          "products.$.status": "Returned",
          "products.$.complete": true,
          "products.$.lastUpdated": new Date(),
        },
      };
    } else if (req.body.status == "rejected") {
      updateStatus = {
        $set: {
          "products.$.status": "Delivered",
          "products.$.complete": true,
          "products.$.lastUpdated": new Date(),
        },
      };
    } else if (req.body.status == "Delivered") {
      updateStatus = {
        $set: {
          "products.$.status": "Delivered",
          "products.$.lastUpdated": new Date(),
          "products.$.deliveryDate": new Date(),
        },
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

//load salesreport page
const loadSalseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filterOption = {};
    if (startDate) {
      filterOption = {
        "products.deliveryDate": {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      }
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
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
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
        $unwind: "$brandDetails",
      },
      {
        $project: {
          _id: 1,
          OID: 1,
          "products.quantity": 1,
          "products.status": 1,
          "products.deliveryDate": 1,
          paymentMethod: 1,
          orderDate: 1,
          userName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          productName: {
            $concat: [
              "$brandDetails.brandName",
              " ",
              "$productDetails.productName",
            ],
          },
          price: "$productDetails.price",
          subtotal: {
            $multiply: ["$products.quantity", "$productDetails.price"],
          },
        },
      },
      {
        $match: filterOption
      }
    ]).exec();
    console.log(orders);
    console.log(filterOption)

    res.render("salesReport", {
      name: req.session.admin,
      search: "",
      orders: orders,
    });
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
  loadSalseReport,
  logout,
};
