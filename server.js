require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const nocache = require("nocache");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const mongoose = require("mongoose");
const morgan = require("morgan");

const port = process.env.PORTNO;

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err.message));

app.use(express.static(path.join(__dirname, "public")));
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.listen(port, () => console.log(`http://localhost:${port}`));
