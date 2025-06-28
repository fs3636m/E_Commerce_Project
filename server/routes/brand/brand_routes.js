const express = require("express");
const {
  createBrand,
  getAllBrands,
  getBrandById,
  addBrandReview,
} = require("../../controllers/brand/brand_controller");

const { authMiddleware } = require("../../controllers/auth/auth_controller");

const router = express.Router();

router.post("/create", authMiddleware, createBrand); // Only brand/admin can use
router.get("/", getAllBrands); // Public
router.get("/:id", getBrandById); // Public
router.post("/:id/review", authMiddleware, addBrandReview); // User gives rating

module.exports = router;
