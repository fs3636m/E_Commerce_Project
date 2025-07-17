const Order = require("../../models/Order");
const Product = require("../../models/products");
const Brand = require("../../models/brand");

// 🔐 Get dashboard summary: total products, orders, units sold, revenue
const getBrandSummary = async (req, res) => {
  try {
    const brandId = req.user.brandId; // set by verifyBrand middleware

    // Get all products by this brand
    const products = await Product.find({ brand: brandId }).select("_id");
    const productIds = products.map((p) => p._id.toString());

    // Count total products
    const totalProducts = products.length;

    // Find orders that include any of this brand’s products
    const orders = await Order.find({ "items.product": { $in: productIds } });

    // Calculate total units sold
    let totalUnitsSold = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        if (productIds.includes(item.product.toString())) {
          totalUnitsSold += item.quantity;
          totalRevenue += item.quantity * item.price;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders: orders.length,
        totalUnitsSold,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("🔥 Error in brand dashboard summary:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand dashboard summary",
    });
  }
};
module.exports = { getBrandSummary };