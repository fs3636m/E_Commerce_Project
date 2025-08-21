const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,

    category: {
      type: String, // you can later convert this to a Category model if needed
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    salePrice: Number,
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },
    averageReview: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
