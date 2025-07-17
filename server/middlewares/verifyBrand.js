const Brand = require("../models/brand");

const verifyBrand = async (req, res, next) => {
  try {
    if (req.user.role !== "brand") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    // ✅ Attach brandId to req.user for use in controllers
    req.user.brandId = brand._id;

    console.log("[verifyBrand] USER ROLE:", req.user.role);
    console.log("👉 Brand ID from token:", req.user.brandId);

    next();
  } catch (err) {
    console.error("[verifyBrand]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = verifyBrand;
