const mongoose = require("mongoose");
const uuid = require("uuid");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    index: true,
  },
  lastName: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: Number,
    index: true,
  },
  profilePic: {
    type: String,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isBlocked: {
    type: Boolean,
    required: true,
    index: true,
    default: false,
  },
  joinedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  Address: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  referralCode: {
    type: String,
    required: true,
    default: uuid.v4(),
  },
});

module.exports = mongoose.model("User", UserSchema, "users");
