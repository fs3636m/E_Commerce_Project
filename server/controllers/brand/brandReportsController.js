const mongoose = require("mongoose");
const Order = require("../../models/Order");

const getBrandSalesReport = async (req, res) => {
  try {
    const brandId = req.user.brandId; // from verifyBrand middleware
    const { period = "day", start, end } = req.query;

    const match = {
      "cartItems.brandId": new mongoose.Types.ObjectId(brandId),
    };

    if (start) match.orderDate = { $gte: new Date(start) };
    if (end) match.orderDate = { ...match.orderDate, $lte: new Date(end) };

    const groupBy =
      period === "year"
        ? { $year: "$orderDate" }
        : period === "month"
        ? { $dateToString: { format: "%Y-%m", date: "$orderDate" } }
        : period === "week"
        ? { $isoWeek: "$orderDate" }
        : { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } };

    const result = await Order.aggregate([
      { $match: match },
      { $unwind: "$cartItems" },
      { $match: { "cartItems.brandId": new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: groupBy,
          qty: { $sum: "$cartItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, series: [{ brand: brandId, data: result }] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error generating report" });
  }
};

module.exports = { getBrandSalesReport };
