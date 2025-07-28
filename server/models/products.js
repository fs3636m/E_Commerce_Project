const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,

    category: {
      type: String, // for now, use string categories like 'men', 'kids'
      required: true,
    },

    // Can be either an ObjectId OR a hardcoded string like "nike"
    brand: {
      type: mongoose.Schema.Types.Mixed, // allow ObjectId or String
      required: true,
    },

    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);