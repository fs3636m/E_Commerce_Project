const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  bio: { type: String },
  profilePicture: { type: String }, // Cloudinary URL
  socialLinks: {
    website: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
  },
  rating: {
    average: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        rating: Number,
        comment: String,
      },
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Brand must have a user owner
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = mongoose.model("Brand", brandSchema);
