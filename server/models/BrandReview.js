// models/brandReview.js
const mongoose = require("mongoose");

const BrandReviewSchema = new mongoose.Schema(
  {
    brandId: String, // stored as string for now
    userId: String,  // stored as string for now
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandReview", BrandReviewSchema);
