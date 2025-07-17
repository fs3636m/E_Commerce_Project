import { useState } from "react";
import CommonForm from "@/components/common/Form";
import ProductImageUpload from "@/components/common/ProductImageUpload";
import { brandFormControls } from "@/constants/brandFormControls";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BrandCreate() {
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      bio: formData.bio,
      profilePicture: uploadedImageUrl,
      socialLinks: {
        website: formData.website,
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
      },
    };

    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/brand/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        navigate("/brand/success"); // Create a success page or redirect
      }
    } catch (err) {
      console.error("Error creating brand:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Brand</h1>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        imageLoadingState={imageLoadingState}
        setImageLoadingState={setImageLoadingState}
      />
      <CommonForm
        formControls={brandFormControls}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Create Brand"
        isBtnDisabled={!uploadedImageUrl}
      />
    </div>
  );
}

export default BrandCreate;
