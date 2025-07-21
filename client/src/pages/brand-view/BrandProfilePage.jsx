import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function BrandProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const defaultImage =
    "https://res.cloudinary.com/dn0v2birb/image/upload/v1752538598/default_assets/brand_default.jpg";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    website: "",
  });
  

  // Load brand profile
  useEffect(() => {
    if (!user?.token) {
  toast.error("❌ You are not logged in. Please log in again.");
  return;
}

    const fetchBrand = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shop/brand/my-brand`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        if (res.data.success) {
          const brand = res.data.brand;
          setName(brand.name || "");
          setBio(brand.bio || "");
          setProfilePicture(brand.profilePicture || "");
          setSocialLinks(brand.socialLinks || {});
        }
      } catch (err) {
        toast.error("❌ Failed to load brand data");
        console.error(err);
      }
    };

    if (user?.token) fetchBrand();
  }, [user]);

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result); // preview
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleSaveProfile = async () => {
  if (!user?.token) {
    toast.error("❌ You are not logged in.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("bio", bio); // ✅ not 'description'
  formData.append("facebook", socialLinks.facebook || "");
  formData.append("instagram", socialLinks.instagram || "");
  formData.append("twitter", socialLinks.twitter || "");
  formData.append("website", socialLinks.website || "");

  if (selectedImageFile) {
    formData.append("image", selectedImageFile);
  }

  setLoading(true);
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/shop/brand/edit`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.data.success) {
      toast.success("✅ Profile updated successfully");
    } else {
      toast.error("⚠️ Something went wrong while updating.");
    }
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);

    if (err.response?.status === 401) {
      toast.error("🔐 Please login again.");
    } else {
      toast.error("❌ Failed to update profile");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Brand Profile</h1>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <Label>bio</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Profile Image Upload */}
        <div>
          <Label>Profile Image</Label>
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            className="hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="imageUpload" className="cursor-pointer inline-block">
            <img
              src={profilePicture || defaultImage}
              alt="Brand profile"
              className="w-20 h-20 rounded-full object-cover mt-2 border"
            />
            <p className="text-sm text-blue-500 underline">Click to upload</p>
          </label>
        </div>

        {/* Social Links */}
        <div>
          <Label>Facebook</Label>
          <Input
            value={socialLinks.facebook || ""}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, facebook: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Instagram</Label>
          <Input
            value={socialLinks.instagram || ""}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, instagram: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Twitter</Label>
          <Input
            value={socialLinks.twitter || ""}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, twitter: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Website</Label>
          <Input
            value={socialLinks.website || ""}
            onChange={(e) =>
              setSocialLinks({ ...socialLinks, website: e.target.value })
            }
          />
        </div>

        {/* Submit */}
        <Button onClick={handleSaveProfile} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

export default BrandProfilePage;
