
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


import { clearCart, fetchCartItems } from "@/store/shop/cart-slice";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((s) => s?.auth?.user?.id);

  useEffect(() => {
      dispatch(clearCart());
    if (userId) {
      dispatch(fetchCartItems(userId)).finally(() => {
        toast.success("Payment successful!");
      });
    }
  }, [dispatch, userId]);

  return (
    <Card className="p-10">
      <CardHeader className="p-0">
        <CardTitle className="text-4xl">Payment is successful!</CardTitle>
      </CardHeader>

      <Button className="mt-5" onClick={() => navigate("/shop/account")}>
        View Orders
      </Button>
    </Card>
  );
}

export default PaymentSuccessPage;
