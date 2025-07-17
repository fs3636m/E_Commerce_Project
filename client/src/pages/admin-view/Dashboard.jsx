import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "@/store/common_slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react"; 

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteImage(imageId) {
    dispatch(deleteFeatureImage(imageId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    }); 
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  const handleDelete = (reviewId) => {
  dispatch(deleteBrandReviewByAdmin(reviewId))
    .unwrap()
    .then(() => {
      toast.success("Review deleted");
      dispatch(getBrandReviews(brandId));
    })
    .catch((err) => toast.error(err));
};


  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>

      <div className="flex flex-col gap-4 mt-5">
        {featureImageList?.length > 0 &&
          featureImageList.map((featureImgItem) => (
            <div className="relative" key={featureImgItem._id}>
              <img
                src={featureImgItem.image}
                className="w-full h-[300px] object-cover rounded-lg"
              />
              <button
                onClick={() => handleDeleteImage(featureImgItem._id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
