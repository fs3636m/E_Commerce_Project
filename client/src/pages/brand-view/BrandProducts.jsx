// components/brand-view/BrandProducts.js
import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import CommonForm from "@/components/common/Form";
import ProductImageUpload from "@/components/common/ProductImageUpload";
import { addProductFormElements } from "@/config/Index";
import { toast } from "sonner";
import {
  addBrandProduct,
  editBrandProduct,
  deleteBrandProduct,
  fetchMyBrandProducts,
} from "@/store/brand/products_slice";
import BrandProductTile from "@/components/brand-view/BrandProductTile";

const initialFormData = {
  title: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  totalStock: "",
  salesPrice: "",
  image: "",
};

function BrandProducts() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.brandProducts);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBrandProducts());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = formData;

    const action = currentEditedId
      ? editBrandProduct({ id: currentEditedId, formData: payload })
      : addBrandProduct(payload);

    dispatch(action).then((res) => {
      if (res.payload && res.payload._id) {
        toast.success(currentEditedId ? "✅ Product updated" : "✅ Product created");
        dispatch(fetchMyBrandProducts());
        resetForm();
      }
    });
  };

  const handleDelete = (productId) => {
    dispatch(deleteBrandProduct(productId)).then((res) => {
      if (res.payload) {
        toast.success("🗑️ Product deleted");
        dispatch(fetchMyBrandProducts());
      }
    });
  };

  const resetForm = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setCurrentEditedId(null);
  };

  const isFormValid = () => {
    const requiredFields = ["title", "description", "price", "category", "image"];
    return requiredFields.every((field) => !!formData[field]);
  };

  return (
    <Fragment>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Products</h1>
            <p className="text-muted-foreground mt-1">
              {products?.length || 0} products listed
            </p>
          </div>
          <Button onClick={() => setOpenDialog(true)} size="lg">
            + Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="animate-pulse bg-muted h-60 rounded-lg"></div>
                <div className="animate-pulse bg-muted h-4 rounded"></div>
                <div className="animate-pulse bg-muted h-4 w-3/4 rounded"></div>
                <div className="animate-pulse bg-muted h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <BrandProductTile
                key={product._id}
                product={product}
                handleDelete={handleDelete}
                setFormData={setFormData}
                setCurrentEditedId={setCurrentEditedId}
                setOpenDialog={setOpenDialog}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-xl p-12 text-center">
            <div className="mx-auto max-w-md space-y-2">
              <h3 className="text-lg font-medium">No products yet</h3>
              <p className="text-muted-foreground">
                Get started by adding your first product
              </p>
              <Button
                onClick={() => setOpenDialog(true)}
                className="mt-4"
              >
                Add Product
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Sheet */}
      <Sheet open={openDialog} onOpenChange={setOpenDialog}>
        <SheetContent side="right" className="w-full sm:w-[600px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">
              {currentEditedId ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <ProductImageUpload
              onUpload={(url) => {
                setFormData((prev) => ({ ...prev, image: url }));
              }}
              onRemove={() => {
                setFormData((prev) => ({ ...prev, image: "" }));
              }}
              image={formData.image}
            />

            <CommonForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              buttonText={currentEditedId ? "Update Product" : "Add Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default BrandProducts;