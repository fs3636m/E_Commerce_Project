const express = require("express");
const { getAllBrandsSalesReport } = require("../../controllers/admin/reports_admin_controller");
const verifyAdmin = require("../../middlewares/verifyAdmin"); // make sure you have admin auth middleware
const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = express.Router();

// GET /api/admin/admin-reports/brands?period=day|week|month|year&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/brands", authMiddleware, verifyAdmin, getAllBrandsSalesReport);


module.exports = router;
