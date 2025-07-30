import ShoppingProductTile from "@/components/shopping-view/product-tile";

function BrandProductTileWrapper({ product }) {
  return (
    <ShoppingProductTile
      product={product}
      disableActions={true} // ✅ Disable add-to-cart & click
    />
  );
}

export default BrandProductTileWrapper;
