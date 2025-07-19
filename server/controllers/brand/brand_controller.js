const mongoose = require("mongoose");
const Brand = require("../../models/brand");
const Product = require("../../models/products");
const { imageUploadUtil } = require("../../helpers/cloudinary");


// 🌐 Public: Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select("name profilePicture rating");
    res.status(200).json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌐 Public: Get single brand by ID with products
const getBrandById = async (req, res) => {
  try {
    const brandId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ success: false, message: "Invalid brand ID" });
    }

    const brand = await Brand.findById(brandId).populate("owner", "username email");
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const products = await Product.find({ brand: brand._id });

    res.status(200).json({
      success: true,
      brand: { ...brand.toObject(), products },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔐 GET: My brand
const getMyBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id }).populate("products");
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.status(200).json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const editBrandProfile = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    // 📦 Extract fields from body
    const {
      name,
      bio,
      location,
      facebook,
      instagram,
      twitter,
      website,
      imageUrl, // in case frontend already uploaded
    } = req.body;

    // ✏️ Update basic info
    if (name) brand.name = name;
   if (bio) brand.bio = bio;
    if (location) brand.location = location;

    // 🌐 Update social links
    brand.socialLinks = {
      facebook: facebook || brand.socialLinks?.facebook || "",
      instagram: instagram || brand.socialLinks?.instagram || "",
      twitter: twitter || brand.socialLinks?.twitter || "",
      website: website || brand.socialLinks?.website || "",
    };

    // 🖼️ Handle profile picture
    if (req.file) {
      const uploaded = await imageUploadUtil(req.file.buffer);
      brand.profilePicture = uploaded.secure_url;
    } else if (imageUrl) {
      brand.profilePicture = imageUrl;
    }

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand profile updated",
      brand,
    });
  } catch (error) {
    console.error("🔥 Error updating brand:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 🔐 POST: Add product (uses logged-in user's brand)
const addProduct = async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    let imageUrl = image; // ✅ Use the passed image first

    // If image not passed, fallback to uploading it from file
    if (!imageUrl && req.file) {
      const uploaded = await imageUploadUtil(req.file.buffer);
      imageUrl = uploaded.secure_url;
    }

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      image: imageUrl || "", // fallback in case both are missing
      brand: brand._id,
    });

    await newProduct.save();

    await Brand.findByIdAndUpdate(brand._id, {
      $push: { products: newProduct._id },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("🔥 Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔐 GET: My brand products
const getMyBrandProducts = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const products = await Product.find({ brand: brand._id });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching brand products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 GET: Single brand product
const getSingleBrandProduct = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    const product = await Product.findById(req.params.id);

    if (!brand || !product || product.brand.toString() !== brand._id.toString()) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// delete brand 
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user.id });
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    await Brand.findByIdAndDelete(brand._id);
    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (err) {
    console.error("🔥 Error deleting brand:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ DELETE product
const deleteBrandProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const brandId = req.user._id;

    const product = await Product.findOne({
      _id: productId,
      brandRef: brandId, // secure: only allow brand owner to delete
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.deleteOne({ _id: productId });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

// ✅ EDIT product
const editBrandProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      brandRef: req.user._id, // must match brand user
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
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

const createBrand = async (req, res) => {
  try {
    const existingBrand = await Brand.findOne({ owner: req.user.id });
    if (existingBrand) {
      return res.status(400).json({ success: false, message: "Brand already exists" });
    }

    const { name, bio, profilePicture, socialLinks } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    if (!bio) {
      return res.status(400).json({ success: false, message: "Brand bio is required" });
    }

    const brand = new Brand({
      name,
      bio,
      profilePicture,
      socialLinks,
      owner: req.user.id,
    });

    await brand.save();
    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Export controller functions
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
  createBrand
};
