const mongoose = require('mongoose');

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
    unique: true,
    index: true,
  },
  profilePic: {
    type: String,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
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
});

module.exports = mongoose.model('User', UserSchema, 'users');
