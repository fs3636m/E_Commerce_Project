const Order = require("../../models/Order");
const Product = require("../../models/products");

const getBrandSummary = async (req, res) => {
  try {
    const brandId = req.user.brandId;

    // 1. Get valid product IDs for this brand (keep as ObjectIds!)
    const products = await Product.find({ brand: brandId }).select("_id");
    const productIds = products.map((p) => p._id);

    // 2. Find orders that include any of this brand’s products
    const orders = await Order.find({
      "cartItems.productId": { $in: productIds },
    });

    // 3. Totals
    let totalOrders = 0;
    let totalUnitsSold = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      let brandHasItem = false;

      for (const item of order.cartItems) {
        // ✅ Compare as ObjectId
        if (productIds.some((id) => id.equals(item.productId))) {
          totalUnitsSold += item.quantity;
          totalRevenue += item.price * item.quantity;
          brandHasItem = true;
        }
      }

      if (brandHasItem) {
        totalOrders += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalOrders,
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
