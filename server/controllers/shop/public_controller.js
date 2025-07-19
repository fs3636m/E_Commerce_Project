const Brand = require("../../models/brand");
const Product = require("../../models/products");

// controller/common_controller.js

const getFeaturedBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
      .limit(4)
      .select("name profilePicture rating");

    res.status(200).json({ success: true, brands });
  } catch (err) {
    console.error("Error fetching featured brands:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Error fetching brands" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .limit(4)
      .select("title image price averageReview");

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching featured products:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

module.exports = {
  getFeaturedBrands,
  getFeaturedProducts,
};


