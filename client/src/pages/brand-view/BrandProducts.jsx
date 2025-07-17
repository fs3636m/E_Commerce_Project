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
  const { products } = useSelector((state) => state.brandProducts);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBrandProducts());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = formData; // ✅ now image is already in formData

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
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenDialog(true)}>Add Product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((productItem) => (
          <BrandProductTile
            key={productItem._id}
            product={productItem}
            handleDelete={handleDelete}
            setFormData={setFormData}
            setCurrentEditedId={setCurrentEditedId}
            setOpenDialog={setOpenDialog}
          />
        ))}
      </div>

      <Sheet open={openDialog} onOpenChange={setOpenDialog}>
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <ProductImageUpload
              onUpload={(url) => {
                setFormData((prev) => ({ ...prev, image: url }));
              }}
              onRemove={() => {
                setFormData((prev) => ({ ...prev, image: "" }));
              }}
              image={formData.image}
            />
          </SheetHeader>

          <div className="py-6">
            <CommonForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              buttonText={currentEditedId ? "Update" : "Add Product"}
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
