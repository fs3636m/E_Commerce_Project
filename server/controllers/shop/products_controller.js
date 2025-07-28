const mongoose = require("mongoose");
const Product = require("../../models/products");
const Brand = require("../../models/brand");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // STEP 1: Fetch products
    const products = await Product.find(filters).sort(sort).lean();

    // STEP 2: Populate brand names for ObjectId types
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        const brandField = product.brand;

        // If it's an ObjectId (string format or actual ObjectId)
        if (mongoose.Types.ObjectId.isValid(brandField)) {
          const brandDoc = await Brand.findById(brandField).select("name");
          if (brandDoc) {
            product.brand = { name: brandDoc.name };
          }
        }

        // If it's already a string (e.g., "Levi"), do nothing
        return product;
      })
    );

    res.status(200).json({
      success: true,
      data: populatedProducts,
    });
  } catch (e) {
    console.error("getFilteredProducts error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
      error: e.message,
    });
  }
};


const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};
module.exports = {
  getFilteredProducts,
  getProductDetails,
};
