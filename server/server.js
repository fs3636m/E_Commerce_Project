require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");


// Route imports
const authRouter = require("./routes/auth/auth_route");
const adminProductRouter = require("./routes/admin/products_routes");
const adminOrderRouter = require("./routes/admin/order_routes");
const shopProductsRouter = require("./routes/shop/products_routes");
const shopCartRouter = require("./routes/shop/cart_routes");
const shopAddressRouter = require("./routes/shop/address_routes");
const shopOrderRouter = require("./routes/shop/order_routes");
const shopSearchRouter = require("./routes/shop/search_routes");
const shopReviewRouter = require("./routes/shop/review_routes");
const commonFeatureRouter = require("./routes/common/feature_routes");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
   .catch((error) => console.log("❌ MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5100;


app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});