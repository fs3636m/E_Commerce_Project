import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductTile from "@/components/shopping-view/product-tile";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRatingComponent from "@/components/common/star_rating";

import { useDispatch, useSelector } from "react-redux";
import { getBrandReviews, addBrandReview } from "@/store/shop/review_slice";

function BrandPublicProfile() {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const { reviews, isLoading } = useSelector((state) => state.shopReview);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/brands/${brandId}`);
        setBrand(res.data.brand);
      } catch (err) {
        console.error("❌ Failed to load brand data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
    dispatch(getBrandReviews(brandId));
  }, [brandId, dispatch]);

  const hasReviewed = user && reviews?.some((r) => r.userId === user._id);

  const handleSubmitReview = () => {
    if (!user) return alert("You must be logged in to submit a review.");
    if (hasReviewed) return alert("You already reviewed this brand.");
    if (rating < 1 || comment.trim().length < 3)
      return alert("Please provide a rating and comment.");

    dispatch(
      addBrandReview({
        brandId,
        reviewValue: rating,
        reviewMessage: comment,
      })
    )
      .unwrap()
      .then(() => {
        setComment("");
        setRating(0);
        dispatch(getBrandReviews(brandId));
      })
      .catch((err) => alert(err));
  };

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!brand) return <p className="text-center text-red-500">Brand not found</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-start gap-6">
        <img
          src={brand?.profilePicture || "/placeholder.jpg"}
          alt={brand?.name}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          <p className="text-muted-foreground mt-2">{brand.bio}</p>
          <div className="flex gap-2 mt-3">
            {brand.socialLinks?.website && (
              <a href={brand.socialLinks.website} target="_blank" className="text-blue-600 underline">Website</a>
            )}
            {brand.socialLinks?.instagram && (
              <a href={brand.socialLinks.instagram} target="_blank" className="text-pink-600 underline">Instagram</a>
            )}
            {brand.socialLinks?.facebook && (
              <a href={brand.socialLinks.facebook} target="_blank" className="text-blue-800 underline">Facebook</a>
            )}
            {brand.socialLinks?.twitter && (
              <a href={brand.socialLinks.twitter} target="_blank" className="text-blue-400 underline">Twitter</a>
            )}
          </div>
          <div className="flex items-center gap-1 mt-3">
            <Star className="text-yellow-500 w-5 h-5" />
            <span className="text-sm font-medium">
              {brand.rating?.average?.toFixed(1) || 0} ({brand.rating?.totalRatings || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* ✅ Products */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Products by {brand.name}</h2>
        {brand.products.length === 0 ? (
          <p className="text-muted-foreground">No products uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brand.products.map((product) => (
              <ProductTile key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ✅ Review Form */}
      <div className="bg-white p-4 rounded-md shadow border max-w-2xl">
        <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
        {!user ? (
          <p className="text-muted-foreground text-sm">Please log in to submit a review.</p>
        ) : hasReviewed ? (
          <p className="text-yellow-600 font-medium">You already reviewed this brand.</p>
        ) : (
          <>
            <StarRatingComponent rating={rating} handleRatingChange={setRating} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              placeholder="Write your feedback..."
            />
            <Button onClick={handleSubmitReview} className="mt-2">Submit Review</Button>
          </>
        )}
      </div>

      {/* ✅ Display Reviews */}
      <div className="mt-8 max-w-2xl">
        <h3 className="text-lg font-bold mb-2">User Reviews</h3>
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-500 w-4 h-4" />
                  <span className="text-sm font-medium">{rev.reviewValue} stars</span>
                </div>
                <p className="text-sm font-medium">{rev.reviewMessage}</p>
                <p className="text-xs text-muted-foreground">– {rev.userName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandPublicProfile;
