const express = require("express");
const router = express.Router();
const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage, 
} = require("../../controllers/common/feature_controller");

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;
