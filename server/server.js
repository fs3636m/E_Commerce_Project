require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5100;

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Middleware
app.use(cors({
  origin: process.env.CLIENT_BASE_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ---------------- ROUTES ------------------ */

// 🔐 Auth
const authRouter = require("./routes/auth/auth_route");
app.use("/api/auth", authRouter);

// 🛒 Shop Routes
app.use("/api/shop/products", require("./routes/shop/products_routes"));
app.use("/api/shop/cart", require("./routes/shop/cart_routes"));
app.use("/api/shop/address", require("./routes/shop/address_routes"));
app.use("/api/shop/order", require("./routes/shop/order_routes"));
app.use("/api/shop/search", require("./routes/shop/search_routes"));
app.use("/api/shop/review", require("./routes/shop/review_routes"));

// 🌟 Common Features (e.g. feature images)
app.use("/api/common/feature", require("./routes/common/feature_routes"));

// 🧑‍💻 Admin Routes
app.use("/api/admin/users", require("./routes/admin/user_routes"));
app.use("/api/admin/products", require("./routes/admin/products_routes"));
app.use("/api/admin/orders", require("./routes/admin/order_routes"));
app.use("/api/admin", require("./routes/admin/brand_review_admin_routes"));
app.use("/api/admin/brands", require("./routes/admin/brand_admin_routes"));


// 🏷️ BRAND: Finalized working routes
app.use("/api/shop", require("./routes/shop/brand_review_routes"));
app.use("/api/shop/brand", require("./routes/shop/brand_private_routes"));  // brand dashboard, upload, edit, etc.
app.use("/api/shop", require("./routes/shop/brand_public_routes"));         // getAllPublicBrands
app.use("/api/brands", require("./routes/brand/brand_public_routes"));      // public view by /:id + reviews

// ❌ 404 Handler
app.use((req, res) => {
  console.log("404 - Route Not Found:", req.method, req.originalUrl);
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
