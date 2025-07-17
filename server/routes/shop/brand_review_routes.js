const express = require("express");
const router = express.Router();
const { addBrandReview, getBrandReviews, getMyBrandReviews, deleteBrandReviewByAdmin } = require("../../controllers/brand/brand_review_controller");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const verifyBrand = require("../../middlewares/verifyBrand");



router.post("/review/brand/:id", authMiddleware, addBrandReview);
router.get("/review/brand/:id", getBrandReviews);
router.delete("/review/brand/:id", authMiddleware, deleteBrandReviewByAdmin);
router.get("/my-reviews", authMiddleware, verifyBrand, getMyBrandReviews);

module.exports = router;
