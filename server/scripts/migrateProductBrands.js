const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Product = require("../models/products");
const Brand = require("../models/brand");

const MONGO_URI = process.env.MONGO_URI; // ✅ make sure this matches .env

const migrateBrandField = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const products = await Product.find({});

    for (const product of products) {
      if (typeof product.brand === "string") {
        const brand = await Brand.findOne({ slug: product.brand }); // or { name: product.brand }

        if (brand) {
          product.brand = brand._id;
          await product.save();
          console.log(`🔁 Updated product ${product.title}`);
        } else {
          console.log(`⚠️  Brand not found for product: ${product.title}`);
        }
      }
    }

    console.log("🎉 Migration complete");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrateBrandField();
