const mongoose = require("mongoose");
const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/products");
const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await imageUploadUtil(req.file.buffer);

    if (!result || result.error) {
      throw new Error(result.error?.message || "Upload failed");
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      result,
    });
  } catch (error) {
    console.error("Error during image upload:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    console.log(averageReview, "averageReview");

    const newlyCreatedProduct = new Product({
  image,
  title,
  description,
  category,
  brand: mongoose.Types.ObjectId(brand),
  price: Number(price),
  salePrice: Number(salePrice) || 0,
  totalStock: Number(totalStock) || 0,
  averageReview: Number(averageReview) || 0,
});


    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({})
      .populate("brand", "name profilePicture socialLinks") // ✅ fetch only what you need
      .lean();

    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params; // product ID from URL
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      image,
    } = req.body;

    // Fetch the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update fields if provided
    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;

    if (brand) {
     
      product.brand = brand; 
    }

    product.price = price !== undefined ? Number(price) : product.price;
    product.salePrice = salePrice !== undefined ? Number(salePrice) : product.salePrice;
    product.totalStock = totalStock !== undefined ? Number(totalStock) : product.totalStock;
    product.averageReview = averageReview !== undefined ? Number(averageReview) : product.averageReview;
    product.image = image || product.image;

    await product.save();

    // Optionally populate brand info in response
    const updatedProduct = await Product.findById(product._id).populate("brand", "name profilePicture");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("editProduct error:", err);
    res.status(500).json({ success: false, message: "Error occurred" });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
