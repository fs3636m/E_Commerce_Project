const express = require("express");
const { brandSalesReport } = require("../../controllers/admin/reports_controller");

const router = express.Router();

// GET /api/admin/reports/brands?period=day|week|month|year&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/reports/brands", brandSalesReport);

module.exports = router;
