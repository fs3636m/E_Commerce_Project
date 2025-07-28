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
import { addProductFormElements } from "@/config/Index";
import ProductImageUpload from "../../components/admin-view/image-upload";
import { editProduct, fetchAllProducts } from "@/store/admin/products_slice";
import { toast } from "sonner";
import { addNewProduct } from "@/store/admin/products_slice";
import AdminProductTile from "@/components/admin-view/product-tile";
import { deleteProduct } from "@/store/admin/products_slice";


const initialFormData = {
  title: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  totalStock: "",
  salesPrice: "",
  image: "null",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState({ initialFormData });
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);

  const dispatch = useDispatch();

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          console.log(data, "edited");
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductDialog(false);
            setFormData(initialFormData);
            toast("Product Updated Successfully");
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          console.log(data);
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductDialog(true);
            setImageFile(null);
            setFormData(initialFormData);
            toast("Product Added Successfully");
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast("Product Deleted Successfully");
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  console.log(productList, "productList");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              imageLoadingState={imageLoadingState}
              isEditMode={currentEditedId !== null}
            />
          </SheetHeader>
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={
                currentEditedId !== null ? "Update Product" : "Add Product"
              }
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
