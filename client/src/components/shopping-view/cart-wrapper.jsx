// src/components/shopping-view/cart-wrapper.jsx 
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart_items_content";

function formatGBP(amount) {
  const n = Number(amount ?? 0);
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

function UserCartWrapper({ cartItems = [], setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          const sale = Number(currentItem?.salePrice ?? 0);
          const price = Number(currentItem?.price ?? 0);
          const qty = Number(currentItem?.quantity ?? 0);
          const unit = sale > 0 ? sale : price;
          return sum + unit * qty;
        }, 0)
      : 0;

  return (
    // The parent <SheetContent> wraps this. We make this fill it and scroll in the middle.
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
      </div>

      {/* Scrollable items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item?.productId} cartItem={item} />
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            Your cart is empty.
          </div>
        )}
      </div>

      {/* Footer (fixed) */}
      <div className="border-t p-4 space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">{formatGBP(totalCartAmount)}</span>
        </div>

        <Button
          onClick={() => {
            navigate("/shop/checkout");
            setOpenCartSheet?.(false);
          }}
          className="w-full"
          disabled={!cartItems?.length}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}

export default UserCartWrapper;
