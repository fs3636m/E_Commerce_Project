const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,

    // Admin still uses this
    brand: String,

    // Brand users will use this
    brandRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
