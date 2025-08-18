const mongoose = require("mongoose");

const BrandReview = require("../../models/BrandReview");
const Brand = require("../../models/brand");

const addBrandReview = async (req, res) => {
  const { reviewMessage, reviewValue } = req.body;
  const brandId = req.params.id;

  try {
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const existing = await BrandReview.findOne({
      userId: req.user.id,
      brandId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this brand",
      });
    }

    await BrandReview.create({
      brandId,
      userId: req.user.id,
      userName: req.user.username,
      reviewMessage,
      reviewValue,
    });

    // Recalculate rating
    const allReviews = await BrandReview.find({ brandId });
    const total = allReviews.length;
    const average =
      allReviews.reduce((sum, r) => sum + r.reviewValue, 0) / total;

    brand.rating = {
      average: Number(average.toFixed(1)),
      totalRatings: total,
    };

    await brand.save();

    res.status(201).json({
      success: true,
      message: "Brand review submitted",
      rating: brand.rating,
    });
  } catch (error) {
    console.error("Error adding brand review:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getBrandReviews = async (req, res) => {
  try {
    const brandId = req.params.id;
    if (!brandId) return res.status(400).json({ success:false, message:"Brand ID is required" });
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ success:false, message:"Invalid Brand ID" });
    }

    // ✅ make sure the field name matches your model and create() call
    const reviews = await BrandReview.find({ brandId })
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    return res.status(200).json({ success: true, data: reviews });
  } catch (e) {
    console.error("getBrandReviews error:", e);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};

const deleteBrandReviewByAdmin = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await BrandReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await BrandReview.findByIdAndDelete(reviewId);

    // Update brand rating
    const allReviews = await BrandReview.find({ brandId: review.brandId });
    const total = allReviews.length;
    const average =
      total === 0
        ? 0
        : allReviews.reduce((sum, r) => sum + r.reviewValue, 0) / total;

    const brand = await Brand.findById(review.brandId);
    if (brand) {
      brand.rating = {
        average: Number(average.toFixed(1)),
        totalRatings: total,
      };
      await brand.save();
    }

    res.status(200).json({ success: true, message: "Review deleted by admin" });
  } catch (err) {
    console.error("Admin delete review error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMyBrandReviews = async (req, res) => {
  try {
    const brandId = req.user.brandId;
    if (!brandId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const reviews = await BrandReview.find({ brandId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("❌ Error getting brand reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addBrandReview,
  getBrandReviews,
  deleteBrandReviewByAdmin,
  getMyBrandReviews,
};
