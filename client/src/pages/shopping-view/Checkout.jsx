// src/pages/shopping/ShoppingCheckout.jsx
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart_items_content";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { createNewOrder } from "@/store/shop/order_slice";
import { toast } from "sonner";

function ShoppingCheckout() {
  const cartItems = useSelector((state) => state.shopCart?.cartItems ?? []); 
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (approvalURL) window.location.href = approvalURL;
  }, [approvalURL]);

  const totalCartAmount = useMemo(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, it) => {
      const sale = Number(it?.salePrice ?? 0);
      const price = Number(it?.price ?? 0);
      const qty = Number(it?.quantity ?? 0);
      const unit = sale > 0 ? sale : price;
      return sum + unit * qty;
    }, 0);
  }, [cartItems]);

  function handleInitiatePaypalPayment() {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      toast("Your cart is empty. Please add items to proceed");
      return;
    }
    if (!currentSelectedAddress) {
      toast("Please select one address to proceed.");
      return;
    }

    const orderData = {
      userId: user?._id ?? user?.id,
      cartItems: cartItems.map((it) => ({
        productId: it?.productId,
        title: it?.title,
        image: it?.image,
        price: Number(it?.salePrice ?? 0) > 0 ? it?.salePrice : it?.price,
        quantity: it?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((res) => {
      setIsPaymentStart(!!res?.payload?.success);
    });
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} alt="Account banner" className="h-full w-full object-cover object-center" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        <div className="flex flex-col gap-4">
          {Array.isArray(cartItems) && cartItems.length > 0
            ? cartItems.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}

          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                ${totalCartAmount.toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <Button onClick={handleInitiatePaypalPayment} className="w-full">
              {isPaymentStart ? "Processing Paypal Payment..." : "Checkout with Paypal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
