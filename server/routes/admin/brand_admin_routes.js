const express = require("express");
const router = express.Router();
const { getAllBrands, deleteBrandByAdmin } = require("../../controllers/admin/brand_controller");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const verifyAdmin = require("../../middlewares/verifyAdmin");

router.get("/brands", authMiddleware, verifyAdmin, getAllBrands); // 🔍 list brands
router.delete("/brands/:id", authMiddleware, verifyAdmin, deleteBrandByAdmin); // ❌ delete brand

module.exports = router;