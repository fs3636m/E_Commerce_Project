import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandOrders } from "@/store/brand/order_slice";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

export default function BrandOrdersView() {
  const dispatch = useDispatch();
  const { brandOrders: orders, isLoading, error } = useSelector(
    (state) => state.brandOrders
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchBrandOrders());
  }, [dispatch]);

  const handleViewItems = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  if (isLoading) return <p className="p-4">Loading orders...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!orders.length)
    return <p className="p-4 text-gray-500">No orders for your brand yet.</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Brand Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>
                <span className="sr-only">View Items</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`py-1 px-3 ${
                      order.status === "confirmed"
                        ? "bg-green-500"
                        : order.status === "rejected"
                        ? "bg-red-600"
                        : "bg-gray-700"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>£{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Dialog
                    open={openDialog && selectedOrder?._id === order._id}
                    onOpenChange={() => setOpenDialog(false)}
                  >
                    <Button onClick={() => handleViewItems(order)}>
                      View Items
                    </Button>
                    {selectedOrder && (
                      <DialogContent className="sm:max-w-[500px] p-4">
                        <h3 className="font-bold mb-2">Order Items</h3>
                        <ul className="list-disc list-inside mb-2">
                          {selectedOrder.items.map((item) => (
                            <li
                              key={item._id}
                              className="flex justify-between mb-1"
                            >
                              <span>{item.title}</span>
                              <span>Qty: {item.quantity}</span>
                              <span>£{item.price.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>£{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
