import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount || 0);

  return (
    <Card className="w-full h-full flex flex-col justify-between rounded-xl shadow hover:shadow-md transition">
      {/* Product Image */}
      <img
        src={product?.image || "/placeholder-product.jpg"}
        alt={product?.title}
        className="w-full h-[220px] object-cover rounded-t-xl"
        onError={(e) => (e.target.src = "/placeholder-product.jpg")}
      />

      {/* Product Info */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <h2 className="text-lg font-semibold truncate">{product?.title}</h2>
        <p className="text-sm text-muted-foreground capitalize">
          {product?.category || "Uncategorized"}
        </p>

        <div className="flex justify-between items-center mt-2">
          <span
            className={`${
              product?.salePrice > 0 ? "line-through text-gray-400" : "text-gray-800"
            } text-base font-semibold`}
          >
            {formatCurrency(product?.price)}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-green-600 font-bold">
              {formatCurrency(product?.salePrice)}
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className="mt-2">
          {product?.totalStock === 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : product?.totalStock < 10 ? (
            <Badge variant="warning">Only {product?.totalStock} left</Badge>
          ) : (
            <Badge variant="success">{product?.totalStock} in Stock</Badge>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            setFormData(product);
          }}
        >
          Edit
        </Button>
        <Button
          className="flex-1"
          variant="destructive"
          onClick={() => handleDelete(product?._id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
