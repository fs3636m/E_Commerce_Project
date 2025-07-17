const express = require("express");
const router = express.Router();
const { deleteBrandReviewByAdmin } = require("../../controllers/brand/brand_review_controller");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const verifyAdmin = require("../../middlewares/verifyAdmin");



// ✅ Admin deletes any review by ID
router.delete("/review/brand/:reviewId",  authMiddleware,verifyAdmin,  deleteBrandReviewByAdmin);

module.exports = router;
