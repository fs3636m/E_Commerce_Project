const mongoose = require("mongoose");
const Order = require("../../models/Order");

const getBrandSalesReport = async (req, res) => {
  try {
    console.log("=== BRAND SALES REPORT DEBUG ===");
    const brandId = req.user.brandId;
    const brandIdObj = new mongoose.Types.ObjectId(brandId);
    const { period = "day", start, end } = req.query;

    // Get ALL orders for this brand first (for debugging)
    const allOrders = await Order.find({
      "cartItems.brandId": brandIdObj
    });
    
    console.log("ALL orders for brand:", allOrders.length);
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        _id: order._id,
        orderDate: order.orderDate,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        cartItems: order.cartItems.map(item => ({
          product: item.title,
          quantity: item.quantity,
          price: item.price,
          brandId: item.brandId.toString()
        }))
      });
    });

    // Now get only valid orders
    const validOrders = await Order.find({
      "cartItems.brandId": brandIdObj,
      orderStatus: { $in: ["confirmed", "shipped", "completed"] },
      paymentStatus: "paid"
    });

    console.log("VALID orders (confirmed+paid):", validOrders.length);
    validOrders.forEach((order, index) => {
      console.log(`Valid Order ${index + 1}:`, {
        _id: order._id,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        cartItems: order.cartItems.map(item => ({
          product: item.title,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      });
    });

    // Calculate manual totals for verification
    let manualQty = 0;
    let manualRevenue = 0;
    
    validOrders.forEach(order => {
      order.cartItems.forEach(item => {
        if (item.brandId.toString() === brandId.toString()) {
          manualQty += item.quantity;
          manualRevenue += item.price * item.quantity;
        }
      });
    });

    console.log("MANUAL CALCULATION - Qty:", manualQty, "Revenue:", manualRevenue);

    // Now run the aggregation
    const dateFilter = {};
    if (start) dateFilter.$gte = new Date(start);
    if (end) dateFilter.$lte = new Date(new Date(end).setHours(23, 59, 59, 999));

    const groupBy = 
      period === "year" ? { $year: "$orderDate" } :
      period === "month" ? { $dateToString: { format: "%Y-%m", date: "$orderDate" } } :
      period === "week" ? { $isoWeek: "$orderDate" } :
      { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } };

    const pipeline = [
      { $unwind: "$cartItems" },
      {
        $match: {
          "cartItems.brandId": brandIdObj,
          orderStatus: { $in: ["confirmed", "shipped", "completed"] },
          paymentStatus: "paid",
          ...(Object.keys(dateFilter).length && { orderDate: dateFilter }),
        },
      },
      {
        $group: {
          _id: groupBy,
          qty: { $sum: "$cartItems.quantity" },
          revenue: { $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await Order.aggregate(pipeline);
    console.log("AGGREGATION RESULT:", JSON.stringify(result, null, 2));

    const totals = result.reduce(
      (acc, r) => {
        acc.totalQty += r.qty;
        acc.totalRevenue += r.revenue;
        return acc;
      },
      { totalQty: 0, totalRevenue: 0 }
    );

    console.log("FINAL TOTALS - Qty:", totals.totalQty, "Revenue:", totals.totalRevenue);
    console.log("=== DEBUG COMPLETE ===");

    res.json({
      success: true,
      series: [{ brandId, data: result }],
      period,
      totals,
      message: result.length === 0 ? "No data for selected range" : undefined,
    });

  } catch (err) {
    console.error("Brand sales report error:", err);
    res.status(500).json({
      success: false,
      message: "Error generating brand sales report",
      error: err.message,
    });
  }
};

module.exports = { getBrandSalesReport };