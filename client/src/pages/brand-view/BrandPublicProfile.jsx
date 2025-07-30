import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Star } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRatingComponent from "@/components/common/star_rating";
import BrandProductTileWrapper from "@/components/brand-view/BrandPublicProductTile";

import { getBrandReviews, addBrandReview } from "@/store/shop/review_slice";

// 🛡️ Format links safely
const formatLink = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

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
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/brands/${brandId}`
        );
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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {/* ✅ Brand Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <img
          src={brand?.profilePicture || "/placeholder.jpg"}
          alt={brand?.name}
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          <p className="text-sm text-muted-foreground">{brand.bio}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm">
            {brand.socialLinks?.website && (
              <a
                href={formatLink(brand.socialLinks.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                Website
              </a>
            )}
            {brand.socialLinks?.instagram && (
              <a
                href={formatLink(brand.socialLinks.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 underline break-all"
              >
                Instagram
              </a>
            )}
            {brand.socialLinks?.facebook && (
              <a
                href={formatLink(brand.socialLinks.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 underline break-all"
              >
                Facebook
              </a>
            )}
            {brand.socialLinks?.twitter && (
              <a
                href={formatLink(brand.socialLinks.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 underline break-all"
              >
                Twitter
              </a>
            )}
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
            <Star className="text-yellow-500 w-4 h-4" />
            <span>
              {brand.rating?.average?.toFixed(1) || "0.0"} (
              {brand.rating?.totalRatings || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <hr className="border-muted" />

      {/* ✅ Products */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Products by {brand.name}
        </h2>
        {!Array.isArray(brand.products) || brand.products.length === 0 ? (
          <p className="text-muted-foreground">No products uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brand.products.map((product) => (
              <BrandProductTileWrapper key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ✅ Leave Review */}
      <div className="bg-white p-4 rounded-md shadow border max-w-2xl">
        <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
        {!user ? (
          <p className="text-muted-foreground text-sm">
            Please log in to submit a review.
          </p>
        ) : hasReviewed ? (
          <p className="text-yellow-600 font-medium">
            You already reviewed this brand.
          </p>
        ) : (
          <>
            <StarRatingComponent
              rating={rating}
              handleRatingChange={setRating}
            />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              placeholder="Write your feedback..."
            />
            <Button onClick={handleSubmitReview} className="mt-2 w-full sm:w-auto">
              Submit Review
            </Button>
          </>
        )}
      </div>

      {/* ✅ Review List */}
      <div className="max-w-2xl">
        <h3 className="text-lg font-bold mb-2">User Reviews</h3>
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-3 bg-gray-50 rounded-md border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="text-yellow-500 w-4 h-4" />
                  <span className="text-sm font-medium">
                    {rev.reviewValue} stars
                  </span>
                </div>
                <p className="text-sm font-medium">{rev.reviewMessage}</p>
                <p className="text-xs text-muted-foreground">
                  – {rev.userName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandPublicProfile;
