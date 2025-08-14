// controllers/admin/reports_controller.js
// UK-ready brand sales report with proper Brand name resolution + debug logs
const mongoose = require("mongoose");
const Order = require("../../models/Order");

const TZ = "Europe/London";

const brandSalesReport = async (req, res) => {
  try {
    const period = String(req.query.period || req.query.granularity || "day").toLowerCase();
    const unit =
      period === "month" ? "month" :
      period === "week"  ? "week"  :
      period === "year"  ? "year"  : "day";

    const startStr = req.query.start;
    const endStr = req.query.end;

    const start = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = endStr
      ? new Date(new Date(endStr).setHours(23, 59, 59, 999))
      : new Date();

    // DEBUG
    console.log("[BRANDS] params:", { period, unit, startStr, endStr, tz: TZ });

    const pipeline = [
      {
        $match: {
          $and: [
            { orderDate: { $gte: start, $lte: end } },
            { $or: [{ orderStatus: { $in: ["paid", "confirmed"] } }, { paymentStatus: "paid" }] },
          ],
        },
      },
      { $unwind: "$cartItems" },

      // normalize productId (string -> ObjectId)
      {
        $addFields: {
          _prodId: {
            $cond: [
              { $eq: [{ $type: "$cartItems.productId" }, "string"] },
              { $toObjectId: "$cartItems.productId" },
              "$cartItems.productId",
            ],
          },
        },
      },

      // join product
      {
        $lookup: {
          from: "products",
          localField: "_prodId",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: { path: "$prod", preserveNullAndEmptyArrays: false } },

      // split brand into id vs legacy string
      {
        $addFields: {
          _brandId: {
            $cond: [
              { $eq: [{ $type: "$prod.brand" }, "objectId"] },
              "$prod.brand",
              null,
            ],
          },
          _brandString: {
            $cond: [
              { $eq: [{ $type: "$prod.brand" }, "string"] },
              { $ifNull: ["$prod.brand", "Unknown"] },
              null,
            ],
          },
        },
      },

      // lookup brand doc if _brandId is present
      {
        $lookup: {
          from: "brands",
          localField: "_brandId",
          foreignField: "_id",
          as: "brandDoc",
        },
      },
      { $unwind: { path: "$brandDoc", preserveNullAndEmptyArrays: true } },

      // compute pricing, qty, resolved brandName, and time bucket
      {
        $addFields: {
          _unitFromItem: {
            $cond: [
              { $gt: ["$cartItems.salePrice", 0] },
              { $toDouble: { $ifNull: ["$cartItems.salePrice", 0] } },
              {
                $cond: [
                  { $isNumber: "$cartItems.price" },
                  { $toDouble: { $ifNull: ["$cartItems.price", 0] } },
                  { $toDouble: { $ifNull: ["$cartItems.price", 0] } },
                ],
              },
            ],
          },
          _unitFromProd: {
            $cond: [
              { $gt: ["$prod.salePrice", 0] },
              { $toDouble: { $ifNull: ["$prod.salePrice", 0] } },
              { $toDouble: { $ifNull: ["$prod.price", 0] } },
            ],
          },
          _qty: { $toInt: { $ifNull: ["$cartItems.quantity", 0] } },

          // Prefer brandDoc.name (ObjectId case). Fallback to legacy string. Else "Unknown".
          _brandName: {
            $cond: [
              { $ifNull: ["$brandDoc.name", false] },
              "$brandDoc.name",
              { $ifNull: ["$_brandString", "Unknown"] },
            ],
          },

          _bucket: {
            $dateTrunc: {
              date: { $ifNull: ["$orderDate", "$createdAt"] },
              unit,
              timezone: TZ,
            },
          },
        },
      },
      {
        $addFields: {
          _unit: { $cond: [{ $gt: ["$_unitFromItem", 0] }, "$_unitFromItem", "$_unitFromProd"] },
          _revenue: { $multiply: [{ $cond: [{ $gt: ["$_unitFromItem", 0] }, "$_unitFromItem", "$_unitFromProd"] }, "$_qty"] },
        },
      },

      // group by resolved brandName + bucket
      {
        $group: {
          _id: { brandName: "$_brandName", t: "$_bucket" },
          unitsSold: { $sum: "$_qty" },
          revenue: { $sum: "$_revenue" },
        },
      },
      { $sort: { "_id.t": 1 } },

      {
        $facet: {
          points: [
            { $project: { _id: 0, brand: "$_id.brandName", t: "$_id.t", unitsSold: 1, revenue: 1 } },
          ],
          summary: [
            { $group: { _id: null, totalUnits: { $sum: "$unitsSold" }, totalRevenue: { $sum: "$revenue" } } },
            { $project: { _id: 0, totalUnits: 1, totalRevenue: 1 } },
          ],
        },
      },
    ];

    const [{ points = [], summary = [] } = {}] = await Order.aggregate(pipeline).allowDiskUse(true);

    console.log("[BRANDS] points:", points.length, "summary:", summary[0]);

    if (req.query.debug === "1") {
      return res.json({ success: true, unit, start, end, rawPoints: points.slice(0, 50) });
    }

    // reshape for chart
    const byBrand = new Map();
    for (const p of points) {
      if (!byBrand.has(p.brand)) byBrand.set(p.brand, []);
      byBrand.get(p.brand).push({
        t: p.t,
        qty: p.unitsSold,
        revenue: Number((p.revenue || 0).toFixed(2)),
      });
    }

    const series = Array.from(byBrand.entries()).map(([brand, data]) => ({ brand, data }));
    const s = summary[0] || { totalUnits: 0, totalRevenue: 0 };

    return res.json({
      success: true,
      period: unit,
      start,
      end,
      series,
      summary: { qty: s.totalUnits, revenue: Number((s.totalRevenue || 0).toFixed(2)) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to get brand sales report" });
  }
};

module.exports = { brandSalesReport };
