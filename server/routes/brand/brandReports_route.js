const express = require("express");
const { getBrandSalesReport } = require("../../controllers/brand/brandReportsController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const verifyBrand = require("../../middlewares/verifyBrand");

const router = express.Router();

// 👇 Run in correct order: auth → verifyBrand → controller
router.get("/my-sales", authMiddleware, verifyBrand, getBrandSalesReport);

module.exports = router;
