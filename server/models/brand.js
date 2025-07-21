const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, "Brand name cannot exceed 50 characters"],
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, "Bio cannot exceed 500 characters"],
  },
  profilePicture: {
    type: String,
    validate: {
      validator: function (v) {
        // Allow empty string or valid URL
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },

  socialLinks: {
    website: {
      type: String,
      validate: {
        validator: function (v) {
          return (
            v === "" ||
            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Review cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add text index for search functionality
brandSchema.index({ name: "text", bio: "text" });

module.exports = mongoose.model("Brand", brandSchema);
