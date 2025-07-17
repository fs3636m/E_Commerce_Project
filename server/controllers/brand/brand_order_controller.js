const Order = require("../../models/Order");
const Product = require("../../models/products");
const Brand = require("../../models/brand");

// 🔐 Get all orders that include this brand’s products
const getBrandOrders = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    const brandProducts = await Product.find({ brandRef: brand._id });
    const brandProductIds = brandProducts.map(p => p._id.toString());

    const allOrders = await Order.find();

    const filteredOrders = allOrders
      .map(order => {
        const brandItems = order.cartItems.filter(item =>
          brandProductIds.includes(item.productId)
        );

        if (brandItems.length === 0) return null;

        return {
          _id: order._id,
          userId: order.userId,
          status: order.orderStatus,
          createdAt: order.orderDate,
          items: brandItems,
          totalAmount: order.totalAmount,
        };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (err) {
    console.error("❌ Brand Order Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getBrandOrders };
