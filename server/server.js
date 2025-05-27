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

const app = express();
const PORT = process.env.PORT || 5100;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Your local development
  "https://e-commerce-project-1-w8qc.onrender.com", // Your production frontend
  "https://e-commerce-project-e8qc.onrender.com" // Your backend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.set('trust proxy', 1); // Required for secure cookies on Render

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




// Server initialization with safe route debugging
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
});

// MongoDB event listeners
mongoose.connection.on('connected', () => {
  console.log('📚 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
