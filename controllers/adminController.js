const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Category = require('../models/categoryModel')
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
    const { filter = "yearly" } = req.query;
    const orders = await Order.find();
    let orderData = Array(3).fill(0);
    let sales;
    if (filter == "yearly") {
      let currentYear = new Date().getFullYear();
      sales = {};
      for (let i = 0; i < 5; i++) {
        sales[currentYear - i] = 0;
      }
    } else if (filter == "monthly") {
      sales = Array(12).fill(0);
    } else if (filter == "weekly") {
      sales = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        sales[formattedDate] = 0;
      }
    }
    orders.forEach((order) => {
      order.products.forEach((product) => {
        if (product.status === "Delivered") {
          if (filter == "yearly") {
            const deliveryYear = new Date(product.deliveryDate).getFullYear();
            if (sales.hasOwnProperty(deliveryYear)) {
              sales[deliveryYear]++;
            }
          } else if (filter == "monthly") {
            const deliveryMonth = new Date(product.deliveryDate).getMonth();
            sales[deliveryMonth]++;
          } else if (filter == "weekly") {
            const deliveryDate = new Date(product.deliveryDate)
              .toISOString()
              .split("T")[0];
            if (sales.hasOwnProperty(deliveryDate)) {
              sales[deliveryDate]++;
            }
          }
          orderData[2]++;
        } else if (product.status === "Returned") {
          orderData[1]++;
        } else if (product.status === "Cancelled") {
          orderData[0]++;
        }
      });
    });
    let salesResult = [];
    if (filter == "yearly") {
      let currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        salesResult.push(sales[currentYear - i]);
      }
    } else if (filter == "monthly") {
      salesResult = sales;
    } else if (filter == "weekly") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        salesResult.push(sales[formattedDate]);
      }
    }

    const topProductsId = await Order.aggregate([
      {$unwind: "$products"},
      {$group: {_id: "$products.productId", count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {count: 0}}
    ]);
    let topProducts = [];
    let topCategories = [];
    let topBrands = [];
    for(let i = 0; i < topProductsId.length; i++){
      let product = await Product.aggregate([
        {$match: {_id: topProductsId[i]._id}},
        {$lookup: {
          from: 'brands',
          localField: 'brandId',
          foreignField: '_id',
          as: 'brand',
        }},
        {$unwind: '$brand'}
      ]);
      product = product[0]
      const brand = await Brand.findById(product.brandId);
      const category = await Category.findById(product.categoryId);
      topProducts.push(product);
      topCategories.push(category);
      topBrands.push(brand);
    }
    topBrands = topBrands.reduce((acc, curr) => {
      if(!acc.set.has(curr._id.toString())) {
        acc.set.add(curr._id.toString())
        acc.arr.push(curr)
      }
      return acc;
    }, {set: new Set(), arr: []})
    topCategories = topCategories.reduce((acc, curr) => {
      if(!acc.set.has(curr._id.toString())) {
        acc.set.add(curr._id.toString())
        acc.arr.push(curr)
      }
      return acc;
    }, {set: new Set(), arr: []})
    console.log(topCategories)
    res.render("adminDashboard", {
      name: req.session.admin,
      salesData: salesResult,
      orderData: orderData,
      topProducts: topProducts,
      topCategories: topCategories.arr,
      topBrands: topBrands.arr
    });
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

//update status of the orders
const updateStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productIndex = order.products.findIndex(
      (obj) => obj.productId.toString() === req.body.productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    let updateStatus = {
      $set: {
        "products.$.status": req.body.status,
        "products.$.lastUpdated": new Date(),
      },
    };

    if (req.body.status === "approved") {
      updateStatus = {
        $set: {
          "products.$.status": "Returned",
          "products.$.lastUpdated": new Date(),
        },
      };
      await Product.findByIdAndUpdate(req.body.productId, {
        $inc: { stock: order.products[productIndex].quantity },
      });

      let refundPrice = order.products[productIndex].subTotal;

      const taxCharge = refundPrice * 0.28;
      refundPrice += taxCharge;

      const productsCount = order.products.filter(
        (p) => !["Cancelled", "Returned"].includes(p.status)
      ).length;

      const discountPerProduct = order.discountAmount
        ? order.discountAmount / productsCount
        : 0;
      refundPrice -= discountPerProduct;

      const transaction = {
        amount: refundPrice,
        type: "Credit",
        date: new Date(),
        description: `Order Refund of ${order.OID}`,
      };

      await Wallet.updateOne(
        { userId: order.userId },
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

      order.products[productIndex].status = "Returned";
      order.products[productIndex].complete = true;
      order.products[productIndex].lastUpdated = new Date();

      if (order.discountAmount) {
        order.discountAmount -= discountPerProduct;
      }

      let remainingTotal = 0;
      for (let i = 0; i < order.products.length; i++) {
        if (
          order.products[i].status !== "Cancelled" &&
          order.products[i].status !== "Returned"
        ) {
          const product = await Product.findById(order.products[i].productId);
          remainingTotal += product.price * order.products[i].quantity;
        }
      }

      const newTaxCharge = remainingTotal * 0.28;

      const deliveryCharge = remainingTotal > 0 ? 60 : 0;
      const newTotalCharge =
        remainingTotal +
        newTaxCharge +
        deliveryCharge -
        (order.discountAmount || 0);

      await Order.findByIdAndUpdate(req.body.orderId, {
        $set: {
          totalCharge: newTotalCharge,
          taxCharge: newTaxCharge,
          deliveryCharge: deliveryCharge,
          discountAmount: order.discountAmount,
          products: order.products,
        },
      });
    } else if (req.body.status === "rejected") {
      updateStatus.$set["products.$.status"] = "Delivered";
      updateStatus.$set["products.$.complete"] = true;
    } else if (req.body.status === "Delivered") {
      updateStatus.$set["products.$.deliveryDate"] = new Date();
    }

    await Order.updateOne(
      { _id: req.body.orderId, "products.productId": req.body.productId },
      updateStatus
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//load salesreport page
const loadSalseReport = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 5 } = req.query;
    let filterOption = { "products.status": "Delivered" };
    if (startDate) {
      filterOption["products.deliveryDate"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    let filterForCount = {};
    if (startDate) {
      filterForCount = {
        "products.deliveryDate": {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const countPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "brands",
          localField: "productDetails.brandId",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      { $unwind: "$brandDetails" },
      { $match: filterOption },
      { $count: "totalCount" },
    ];

    const countTotalOrders = [
      { $unwind: "$products" },
      { $match: filterForCount },
    ];

    const countDeliveredOrders = [
      { $unwind: "$products" },
      { $match: filterOption },
    ];

    const totalOrderCount = await Order.aggregate(countTotalOrders).exec();
    const totalDeliveredCount = await Order.aggregate(
      countDeliveredOrders
    ).exec();

    const totalDocsResult = await Order.aggregate(countPipeline).exec();
    const totalOrders =
      totalDocsResult.length > 0 ? totalDocsResult[0].totalCount : 0;
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (page - 1) * limit;

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "brands",
          localField: "productDetails.brandId",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      { $unwind: "$brandDetails" },
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
      { $match: filterOption },
      { $skip: skip },
      { $limit: limit },
    ]).exec();

    res.render("salesReport", {
      name: req.session.admin,
      orders: orders,
      currentPage: page,
      totalPages: totalPages,
      totalOrders: totalOrderCount.length,
      totalDeliveredOrders: totalDeliveredCount.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

//getting data for sales report pdf/excel
const getOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filterOption = { "products.status": "Delivered" };
    if (startDate) {
      filterOption["products.deliveryDate"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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
      { $unwind: "$user" },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "brands",
          localField: "productDetails.brandId",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      { $unwind: "$brandDetails" },
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
      { $match: filterOption },
    ]).exec();
    let totalAmount = 0;
    for (let product of orders) {
      totalAmount += Number(product.price);
    }
    res
      .status(200)
      .json({
        orders: orders,
        totalOrders: orders.length,
        totalAmount: totalAmount,
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

//404 page not found
const loadErrorPage = async (req, res) => {
  try {
    res.render("errorPage");
  } catch (err) {
    console.log(err);
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
  loadErrorPage,
  getOrders,
  logout,
};
