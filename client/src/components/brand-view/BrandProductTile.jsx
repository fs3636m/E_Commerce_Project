import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BrandProductTile = ({
  product,
  handleDelete,
  setFormData,
  setCurrentEditedId,
  setOpenDialog,
}) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount || 0);

  const handleEdit = () => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || "",
      totalStock: product.totalStock || "",
      salesPrice: product.salesPrice || "",
      image: product.image || "",
    });
    setCurrentEditedId(product._id);
    setOpenDialog(true);
  };

  // Get stock badge
  const getStockBadge = () => {
    if (product.totalStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.totalStock < 10) {
      return <Badge variant="warning">Only {product.totalStock} left</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
      <img
        src={product.image || "/placeholder-product.jpg"}
        alt={product.title}
        className="w-full h-40 sm:h-44 md:h-48 object-cover"
        onError={(e) => {
          e.target.src = "/placeholder-product.jpg";
        }}
      />

      <div className="p-4 flex flex-col justify-between flex-1">
        {/* Title and Price */}
        <div className="space-y-1 mb-3">
          <p className="font-semibold text-base sm:text-lg truncate">
            {product.title}
          </p>
          <p className="text-muted-foreground text-sm capitalize">
            {product.category || "Uncategorized"}
          </p>
          <p className="text-lg font-bold">
            {formatCurrency(product.price)}{" "}
            {product.salesPrice > 0 && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatCurrency(product.salesPrice)}
              </span>
            )}
          </p>
          <div className="pt-1">{getStockBadge()}</div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={handleEdit}
            size="sm"
            variant="outline"
            className="flex-1 whitespace-nowrap"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            size="sm"
            variant="destructive"
            className="flex-1 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandProductTile;
