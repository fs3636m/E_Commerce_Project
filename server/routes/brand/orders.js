// routes/brand/orders.js
const express = require("express");
const { getBrandOrders } = require("../../controllers/brand/brand_order_controller");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = express.Router();

// GET /api/brand/orders
router.get("/orders", authMiddleware, getBrandOrders);

module.exports = router;
