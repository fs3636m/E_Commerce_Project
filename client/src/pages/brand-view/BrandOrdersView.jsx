import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandOrders } from "@/store/brand/order_slice";
import { Card } from "@/components/ui/card";

const BrandOrdersView = () => {
  const dispatch = useDispatch();
  const { brandOrders: orders, isLoading, error } = useSelector((state) => state.brandOrders);

  useEffect(() => {
    dispatch(fetchBrandOrders());
  }, [dispatch]);

  if (isLoading) return <p className="p-4">Loading orders...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!orders.length) return <p className="p-4 text-gray-500">No orders for your brand yet.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Brand Orders</h2>

      {orders.map((order) => (
        <Card key={order._id} className="p-4">
          <div className="mb-2">
            <strong>Order ID:</strong> {order._id}
          </div>
          <div>
            <strong>Status:</strong> {order.orderStatus} |{" "}
            <strong>Total:</strong> ₦{order.totalAmount.toLocaleString()}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
          </div>

          <div className="mt-2">
            <strong>Items:</strong>
            <ul className="list-disc list-inside mt-1">
              {order.cartItems.map((item, i) => (
                <li key={i}>
                  {item.title} × {item.quantity} – ₦{item.price}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BrandOrdersView;
