const express = require("express");
const router = express.Router();

const {
  getAllBrands,
  getBrandById,
} = require("../../controllers/brand/brand_controller");


// 🌐 Public: List all brands
router.get("/all", getAllBrands);

// 🌐 Public: Get one brand by ID
router.get("/:id", getBrandById);

module.exports = router;
