const express = require("express");
const router = express.Router();
const Brand = require("../../models/brand");
const Product = require("../../models/products");

// GET a single brand and its products
router.get("/:brandId", async (req, res) => {
  try {
    const brandId = req.params.brandId;

    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    const products = await Product.find({ brandRef: brandId });
    res.status(200).json({ success: true, brand: { ...brand.toObject(), products } });
  } catch (err) {
    console.error("Error fetching brand:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
