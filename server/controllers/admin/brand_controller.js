const Brand = require("../../models/brand");

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
      .select("name profilePicture bio rating owner products")
      .populate('owner', 'name email') // Populate owner info
      .populate('products', 'name price') // Populate basic product info
      .populate('rating.reviews.userId', 'name'); // Populate reviewer names

    res.status(200).json({ 
      success: true, 
      data: brands // Match your thunk expectation (res.data.data)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch brands"
    });
  }
};

const deleteBrandByAdmin = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ 
        success: false, 
        message: "Brand not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Brand deleted successfully",
      deletedId: brand._id // Match your thunk expectation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to delete brand" 
    });
  }
};

module.exports = { getAllBrands, deleteBrandByAdmin };