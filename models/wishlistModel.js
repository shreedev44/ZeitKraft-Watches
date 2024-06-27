const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  products: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
});

module.exports = mongoose.model("Wishlist", WishlistSchema, "wishlists");
