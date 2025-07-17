import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  }).format(amount);

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

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <img
        src={product.image || "/placeholder-product.jpg"}
        alt={product.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-3 space-y-1">
        <p className="font-semibold">{product.title}</p>
        <p className="text-muted-foreground text-sm">{formatCurrency(product.price)}</p>
        <div className="flex justify-between gap-2 mt-3">
          <Button onClick={handleEdit} size="sm" variant="outline">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            size="sm"
            variant="destructive"
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
