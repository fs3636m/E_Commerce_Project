require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filePath = path.join(__dirname, "assets/default-profile.jpeg"); // Change to your file location

cloudinary.uploader.upload(filePath, {
  folder: "default_assets",
  public_id: "brand_default",
}, (error, result) => {
  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("✅ Uploaded:", result.secure_url);
  }
});
