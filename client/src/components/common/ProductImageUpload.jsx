import { useState } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";

export default function ProductImageUpload({ onUpload, onRemove, image }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(image || null);

  const userRole = useSelector((state) => state.auth.user?.role);
  const token = sessionStorage.getItem("token")?.replace(/"/g, "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      // Dynamically choose the right route based on role
      const uploadUrl =
        userRole === "brand"
          ? `${import.meta.env.VITE_API_URL}/api/shop/brand/upload-image`
          : `${import.meta.env.VITE_API_URL}/api/admin/products/upload-image`;

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const imageUrl = response.data?.url;
      setUploadedImage(imageUrl);
      if (onUpload) onUpload(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (onRemove) onRemove();
  };

  return (
    <div className="w-full flex flex-col items-start gap-2">
      {uploading ? (
        <Skeleton height={150} width={150} />
      ) : uploadedImage ? (
        <div className="relative group">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-40 h-40 rounded-md object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100 transition"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer border rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition">
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
