const express = require("express");
const router = express.Router();
const {
  getFeaturedBrands,
  getFeaturedProducts,
} = require("../../controllers/shop/public_controller");

// Route: GET /api/shop/brands/featured
router.get("/brands/featured", getFeaturedBrands);

// Route: GET /api/shop/products/featured
router.get("/products/featured", getFeaturedProducts);

module.exports = router;
