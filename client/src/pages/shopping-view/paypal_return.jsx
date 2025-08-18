import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order_slice";
import { clearCart } from "@/store/shop/cart-slice";        // ← add
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";      // ← need userId
import { useLocation, useNavigate } from "react-router-dom"; // ← use SPA navigate

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  const userId = useSelector((s) => s.auth?.user?.id);

  useEffect(() => {
    if (!paymentId || !payerId) return;

    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
    dispatch(capturePayment({ paymentId, payerId, orderId })).then((action) => {
      if (action?.payload?.success) {
        // optimistic UI clear so header/cart UI updates immediately
        dispatch(clearCart());
        sessionStorage.removeItem("currentOrderId");

        // optional: tell the success page to refetch (belt & suspenders)
        sessionStorage.setItem("shouldRefetchCart", "1");

        // SPA navigation (avoid full page reload so your cleared Redux state persists)
        navigate("/shop/payment-success", { replace: true });
      }
    });
  }, [paymentId, payerId, dispatch, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment... Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalReturnPage;
