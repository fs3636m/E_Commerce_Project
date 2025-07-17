import ShoppingProductTile from "@/components/shopping-view/product-tile";

function BrandProductTileWrapper({ product }) {
  return (
    <ShoppingProductTile
      product={product}
      handleAddtoCart={() => {}} // disable add to cart
      handleGetProductDetails={() => {}} // disable details
    />
  );
}

export default BrandProductTileWrapper;
