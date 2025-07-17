// routes/shop/brand_private_routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const { upload, imageUploadUtil } = require("../../helpers/cloudinary");
const {
  addProduct,
  getMyBrand,
  getMyBrandProducts,
  deleteBrand,
  editBrandProfile,
  getSingleBrandProduct,
  editBrandProduct,
  deleteBrandProduct,
} = require("../../controllers/brand/brand_controller");
const { getBrandOrders } = require("../../controllers/brand/brand_order_controller");
const { getBrandSummary } = require("../../controllers/brand/brand_dashboard_controller");

const { authMiddleware } = require("../../middlewares/authMiddleware");
const verifyBrand = require("../../middlewares/verifyBrand");

// ✅ NEW: Brand creates product (No brandId needed)
router.post(
  "/upload-product",
  authMiddleware,
  verifyBrand,
  upload.single("image"),
  addProduct
);

// ✅ (Keep the rest as is, just make sure this one above exists)
router.get("/my-brand", authMiddleware, verifyBrand, getMyBrand);
router.get("/summary", authMiddleware, verifyBrand, getBrandSummary);
router.get("/brand/orders", authMiddleware, verifyBrand, getBrandOrders);
router.get("/my-products", authMiddleware, verifyBrand, getMyBrandProducts);
router.delete("/delete", authMiddleware, verifyBrand, deleteBrand);
router.put("/edit", authMiddleware, verifyBrand, upload.single("image"), editBrandProfile);
router.get("/product/:id", authMiddleware, verifyBrand, getSingleBrandProduct);
router.put("/edit-product/:productId", authMiddleware, verifyBrand, editBrandProduct);
router.delete("/delete-product/:productId", authMiddleware, verifyBrand, deleteBrandProduct);

// ✅ Optional: image upload
router.post(
  "/upload-image",
  authMiddleware,
  verifyBrand,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No image uploaded" });
      const result = await imageUploadUtil(req.file.buffer);
      res.status(200).json({ success: true, url: result.secure_url });
    } catch (err) {
      console.error("🔥 Image upload error:", err.message);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

module.exports = router;
