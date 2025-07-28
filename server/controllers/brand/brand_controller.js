const mongoose = require("mongoose");
const Brand = require("../../models/brand");
const Product = require("../../models/products");
const { imageUploadUtil } = require("../../helpers/cloudinary");

// 🌐 Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select("name profilePicture rating");
    res.status(200).json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌐 Get brand by ID (with products)
const getBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid brand ID" });
    }

    const brand = await Brand.findById(brandId).populate(
      "owner",
      "username email"
    );
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    const products = await Product.find({
      $or: [{ brand: brand._id }, { brand: brand._id.toString() }],
    });

    res.status(200).json({
      success: true,
      brand: { ...brand.toObject(), products },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔐 Get brand owned by current user
const getMyBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id }).populate(
      "products"
    );
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Edit brand profile
const editBrandProfile = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    const {
      name,
      bio,
      location,
      facebook,
      instagram,
      twitter,
      website,
      imageUrl,
    } = req.body;

    // Validate incoming data
    if (
      !name &&
      !bio &&
      !location &&
      !facebook &&
      !instagram &&
      !twitter &&
      !website &&
      !imageUrl
    ) {
      return res
        .status(400)
        .json({ success: false, message: "No updates provided" });
    }

    // Update brand document
    brand.name = name || brand.name;
    brand.bio = bio || brand.bio;
    brand.location = location || brand.location;

    brand.socialLinks = {
      facebook: facebook || brand.socialLinks?.facebook || "",
      instagram: instagram || brand.socialLinks?.instagram || "",
      twitter: twitter || brand.socialLinks?.twitter || "",
      website: website || brand.socialLinks?.website || "",
    };

    if (req.file) {
      try {
        const uploaded = await imageUploadUtil(req.file.buffer);
        brand.profilePicture = uploaded.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Error uploading image" });
      }
    } else if (imageUrl) {
      brand.profilePicture = imageUrl;
    }

    await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand profile updated",
      brand,
    });
  } catch (error) {
    console.error("Error editing brand:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Create a product for the logged-in brand
const addProduct = async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;

    if (!title || !description || !price || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand)
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });

    let imageUrl = image;
    if (!imageUrl && req.file) {
      const uploaded = await imageUploadUtil(req.file.buffer);
      imageUrl = uploaded.secure_url;
    }

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      image: imageUrl || "",
      brand: brand._id,
    });

    await newProduct.save();
    await Brand.findByIdAndUpdate(brand._id, {
      $push: { products: newProduct._id },
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Get all products for brand owner
const getMyBrandProducts = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    const products = await Product.find({
      $or: [{ brand: brand._id }, { brand: brand._id.toString() }],
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Get one product from brand
const getSingleBrandProduct = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    const product = await Product.findById(req.params.id);

    if (
      !brand ||
      !product ||
      product.brand?.toString() !== brand._id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Edit brand product
const editBrandProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    const product = await Product.findOne({
      _id: productId,
      $or: [{ brand: brand._id }, { brand: brand._id.toString() }],
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // update fields
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.price = req.body.price || product.price;
    product.salePrice = req.body.salePrice || product.salePrice;
    product.totalStock = req.body.totalStock || product.totalStock;
    product.image = req.body.image || product.image;

    await product.save();

    res.status(200).json({
      success: true,
      product,
      message: "Product updated",
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// 🔐 Delete brand product
const deleteBrandProduct = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      brand: brand._id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.deleteOne({ _id: productId });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Delete brand account
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    await Brand.findByIdAndDelete(brand._id);
    res.status(200).json({ success: true, message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 Create a new brand
const createBrand = async (req, res) => {
  try {
    const existing = await Brand.findOne({ owner: req.user.id });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Brand already exists" });
    }

    const { name, bio, profilePicture, socialLinks } = req.body;

    if (!name || !bio) {
      return res
        .status(400)
        .json({ success: false, message: "Name and bio required" });
    }

    const newBrand = new Brand({
      name,
      bio,
      profilePicture,
      socialLinks,
      owner: req.user.id,
    });

    await newBrand.save();
    res.status(201).json({ success: true, brand: newBrand });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Export all functions
module.exports = {
  getAllBrands,
  getBrandById,
  getMyBrand,
  editBrandProfile,
  addProduct,
  getMyBrandProducts,
  getSingleBrandProduct,
  editBrandProduct,
  deleteBrandProduct,
  deleteBrand,
  createBrand,
};
