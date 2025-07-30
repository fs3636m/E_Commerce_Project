const Brand = require("../../models/brand");
const Product = require("../../models/products");


const getFeaturedBrands = async (req, res) => {
  try {
    const brands = await Brand.aggregate([
      { $sample: { size: 4 } }, // randomly pick 4 brands
      { $project: { name: 1, profilePicture: 1, rating: 1 } },
    ]);

    res.status(200).json({ success: true, brands });
  } catch (err) {
    console.error("Error fetching featured brands:", err);
    res.status(500).json({ success: false, message: "Error fetching brands" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { totalStock: { $gt: 0 } } },
      { $sample: { size: 6 } },
      {
        $project: {
          title: 1,
          image: 1,
          price: 1,
          averageReview: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

module.exports = {
  getFeaturedBrands,
  getFeaturedProducts,
};



