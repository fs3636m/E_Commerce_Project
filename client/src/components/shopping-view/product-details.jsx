import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products_slice";
import { addReview, getReviews } from "@/store/shop/review_slice";
import StarRatingComponent from "../common/star_rating";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews = [] } = useSelector((state) => state.shopReview || {});

  const handleDialogClose = useCallback(() => {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }, [dispatch, setOpen]);

  const handleRatingChange = useCallback((newRating) => {
    setRating(newRating);
  }, []);

  const handleAddToCart = useCallback(
    (getCurrentProductId, getTotalStock) => {
      const list = cartItems?.items || [];

      if (list.length) {
        const idx = list.findIndex((it) => it.productId === getCurrentProductId);
        if (idx > -1) {
          const qty = list[idx].quantity;
          if (qty + 1 > getTotalStock) {
            toast(`Only ${qty} quantity can be added for this item`);
            return;
          }
        }
      }

      dispatch(
        addToCart({
          userId: user?.id,
          productId: getCurrentProductId,
          quantity: 1,
        })
      ).then((res) => {
        if (res?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast("Product is added to cart");
        } else {
          toast.error(res?.payload || "Could not add to cart");
        }
      });
    },
    [cartItems?.items, dispatch, user?.id]
  );

  const handleAddReview = useCallback(() => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewMsg.trim()) {
      toast.error("Please write a short review");
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((action) => {
      if (addReview.fulfilled.match(action)) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast.success("Review added successfully!");
        return;
      }

      const serverMsg =
        action.payload || action.error?.message || "Could not submit review";

      if (/purchase/i.test(serverMsg)) {
        toast.error("You must purchase this product before reviewing.");
        return;
      }

      toast.error(serverMsg);
    });
  }, [dispatch, productDetails?._id, rating, reviewMsg, user?.id, user?.userName]);

  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails?._id]);

  const averageReview = useMemo(() => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r?.reviewValue || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-screen overflow-y-auto">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-2xl mt-4 mb-5">
              {productDetails?.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              £{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-2xl font-bold text-muted-foreground">
                £{productDetails?.salePrice}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>

          <div className="mt-5 mb-5">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(productDetails?._id, productDetails?.totalStock)
                }
              >
                Add to Cart
              </Button>
            )}
          </div>

          <Separator />

          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>

            <div className="grid gap-6">
              {reviews?.length > 0 ? (
                reviews.map((r) => (
                  <div className="flex gap-4" key={r._id}>
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {(r?.userName?.[0] || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{r?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={r?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">{r?.reviewMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>

            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(e) => setReviewMsg(e.target.value)}
                placeholder="Write a review..."
              />
              <Button
                onClick={handleAddReview}
                disabled={rating === 0 || reviewMsg.trim() === ""}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
