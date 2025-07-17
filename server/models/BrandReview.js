const mongoose = require("mongoose");

const BrandReviewSchema = new mongoose.Schema(
  {
    brandId: String,
    userId: String,
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandReview", BrandReviewSchema);
