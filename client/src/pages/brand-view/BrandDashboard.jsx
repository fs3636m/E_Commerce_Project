import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandSummary } from "@/store/brand/summary_slice";
import { fetchMyBrandProducts } from "@/store/brand/products_slice";
import { getMyBrandReviews } from "@/store/shop/review_slice";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilIcon, PlusIcon, Star } from "lucide-react";

const BrandDashboard = () => {
  const [brand, setBrand] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const defaultProfileImage =
    "https://res.cloudinary.com/dn0v2birb/image/upload/v1752538598/default_assets/brand_default.jpg";

  const { summary } = useSelector((state) => state.brandSummary);
  const { products } = useSelector((state) => state.brandProducts);
  const { reviews, isLoading } = useSelector((state) => state.shopReview);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shop/brand/my-brand`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setBrand(res.data.brand);
      } catch (err) {
        setError(err?.response?.data?.message || "Something went wrong");
      }
    };

    fetchBrand();
    dispatch(fetchBrandSummary());
    dispatch(fetchMyBrandProducts());
    dispatch(getMyBrandReviews());
  }, [dispatch]);

  const formatGBP = (amount) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!brand) return <p className="p-4">Loading brand dashboard...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
  {/* ✅ Brand Info */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
    <img
      src={brand.profilePicture || defaultProfileImage}
      alt={brand.name}
      className="w-24 h-24 rounded-full object-cover border mx-auto sm:mx-0"
    />
    <div className="flex-1 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl font-bold">{brand.name}</h1>
      <p className="text-muted-foreground">{brand.bio}</p>
      <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-blue-600">
        {brand.socialLinks?.website && (
          <a href={brand.socialLinks.website} target="_blank" className="underline">Website</a>
        )}
        {brand.socialLinks?.instagram && (
          <a href={brand.socialLinks.instagram} target="_blank" className="underline">Instagram</a>
        )}
        {brand.socialLinks?.facebook && (
          <a href={brand.socialLinks.facebook} target="_blank" className="underline">Facebook</a>
        )}
        {brand.socialLinks?.twitter && (
          <a href={brand.socialLinks.twitter} target="_blank" className="underline">Twitter</a>
        )}
      </div>
    </div>

    <div className="flex justify-center sm:justify-end">
      <Button variant="outline" onClick={() => navigate("/brand/edit-profile")}>
        <PencilIcon className="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
    </div>
  </div>

  {/* ✅ Summary Cards */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <Card className="p-4 text-center">
      <p className="text-muted-foreground text-sm">Products</p>
      <p className="text-xl font-semibold">
        {typeof summary?.totalProducts === "number" ? summary.totalProducts : "—"}
      </p>
    </Card>
    <Card className="p-4 text-center">
      <p className="text-muted-foreground text-sm">Orders</p>
      <p className="text-xl font-semibold">{summary?.totalOrders ?? "—"}</p>
    </Card>
    <Card className="p-4 text-center">
      <p className="text-muted-foreground text-sm">Units Sold</p>
      <p className="text-xl font-semibold">{summary?.totalUnitsSold ?? "—"}</p>
    </Card>
    <Card className="p-4 text-center">
      <p className="text-muted-foreground text-sm">Revenue</p>
      <p className="text-xl font-semibold">{formatGBP(summary?.totalRevenue ?? 0)}</p>
    </Card>
  </div>

  {/* ✅ Products */}
  <div>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <h2 className="text-lg font-bold">Your Products</h2>
      <Button onClick={() => navigate("/brand/products")}>
        <PlusIcon className="w-4 h-4 mr-2" />
        Manage Products
      </Button>
    </div>

    {products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product._id} className="p-3 space-y-2">
            <img
              src={product.image || "/placeholder-product.jpg"}
              alt={product.title}
              className="w-full h-40 object-cover rounded-md"
            />
            <p className="font-semibold">{product.title}</p>
            <p className="text-muted-foreground text-sm">{formatGBP(product.price)}</p>
          </Card>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground">No products uploaded yet.</p>
    )}
  </div>

  {/* ✅ Brand Reviews */}
  <div className="bg-white p-5 border rounded-xl shadow-sm">
    <h2 className="text-lg font-bold mb-4">Customer Reviews</h2>
    {isLoading ? (
      <Skeleton className="h-24 w-full rounded-md" />
    ) : reviews.length === 0 ? (
      <p className="text-muted-foreground">No reviews yet for your brand.</p>
    ) : (
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="p-3 border rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{rev.reviewValue} stars</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">{rev.reviewMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">– {rev.userName}</p>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

  );
};

export default BrandDashboard;
