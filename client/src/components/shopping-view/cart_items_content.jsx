// src/components/shopping-view/cart_items_content.jsx
import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { toast } from "sonner";

function unitPrice(item) {
  const sale = Number(item?.salePrice ?? 0);
  const price = Number(item?.price ?? 0);
  return sale > 0 ? sale : price;
}

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.shopCart?.cartItems ?? []); // ARRAY
  const productList = useSelector((state) => state.shopProducts?.productList ?? []);
  const dispatch = useDispatch();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus" && Array.isArray(cartItems) && cartItems.length) {
      const indexOfCurrentCartItem = cartItems.findIndex(
        (item) => String(item?.productId) === String(getCartItem?.productId)
      );

      const productIdx = productList.findIndex(
        (p) => String(p?._id) === String(getCartItem?.productId)
      );
      const totalStock = Number(productList?.[productIdx]?.totalStock ?? Infinity);

      if (indexOfCurrentCartItem > -1) {
        const q = Number(cartItems[indexOfCurrentCartItem]?.quantity ?? 0);
        if (q + 1 > totalStock) {
          toast.error(`Only ${totalStock} in stock. Can't add more.`);
          return;
        }
      }
    }

    const nextQty =
      typeOfAction === "plus"
        ? Number(getCartItem?.quantity ?? 0) + 1
        : Number(getCartItem?.quantity ?? 0) - 1;

    if (nextQty < 1) return;

    dispatch(
      updateCartQuantity({
        userId: user?._id ?? user?.id,
        productId: getCartItem?.productId,
        quantity: nextQty,
      })
    ).then((res) => {
      if (res?.payload?.success) {
        toast.success("Cart item updated");
      } else {
        toast.error(res?.payload?.message || "Failed to update cart item");
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?._id ?? user?.id,
        productId: getCartItem?.productId,
      })
    ).then((res) => {
      if (res?.payload?.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(res?.payload?.message || "Failed to remove item");
      }
    });
  }

  const priceEach = unitPrice(cartItem);
  const qty = Number(cartItem?.quantity ?? 0);
  const lineTotal = priceEach * qty;

  return (
    <div className="flex items-center space-x-4">
      <img
        className="w-20 h-20 rounded object-cover"
        src={cartItem?.image || ""}
        alt={cartItem?.title || "Product"}
        onError={(e) => {
          e.currentTarget.src = "";
        }}
      />

      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title || "Untitled"}</h3>

        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={qty <= 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          <span className="font-semibold">{qty}</span>

          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <p className="font-semibold">
          £{Number.isFinite(lineTotal) ? lineTotal.toFixed(2) : "0.00"}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
