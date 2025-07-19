import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products_slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ProductFilter from "@/components/shopping-view/Filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon } from "lucide-react";
import { sortOptions } from "@/config/Index";
import { toast } from "sonner";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      queryParams.push(`${key}=${encodeURIComponent(value.join(","))}`);
    }
  }

  return queryParams.join("&");
}

export default function ShoppingList() {
  const dispatch = useDispatch();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const [filters, setFilters] = useState(null);
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const categorySearchParam = searchParams.get("category");

  const handleSort = (value) => setSort(value);

  const handleFilter = (sectionId, option) => {
    const updatedFilters = { ...filters };
    const currentOptions = updatedFilters[sectionId] || [];

    if (currentOptions.includes(option)) {
      updatedFilters[sectionId] = currentOptions.filter((o) => o !== option);
    } else {
      updatedFilters[sectionId] = [...currentOptions, option];
    }

    setFilters(updatedFilters);
    sessionStorage.setItem("filters", JSON.stringify(updatedFilters));
  };

  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  const handleAddtoCart = (productId, stock) => {
    const items = cartItems.items || [];
    const existing = items.find((item) => item.productId === productId);

    if (existing && existing.quantity + 1 > stock) {
      toast(`Only ${stock} available for this product`);
      return;
    }

    dispatch(
      addToCart({ userId: user?.id, productId, quantity: 1 })
    ).then((res) => {
      if (res?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast("Product added to cart");
      }
    });
  };

  // Filters/sort sync
  useEffect(() => {
    setSort("price-lowtohigh");
    const storedFilters = JSON.parse(sessionStorage.getItem("filters")) || {};
    setFilters(storedFilters);
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const query = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(query));
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParams: sort }));
    }
  }, [dispatch, sort, filters]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-6 p-4 md:p-6">
      {/* Filter Sidebar */}
      <aside className="space-y-4">
        <ProductFilter filters={filters} handleFilter={handleFilter} />
      </aside>

      {/* Main Content */}
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold tracking-tight">All Products</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {productList?.length || 0} items
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((item) => (
                    <DropdownMenuRadioItem key={item.id} value={item.id}>
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {productList && productList.length > 0 ? (
            productList.map((product) => (
              <ShoppingProductTile
                key={product._id}
                product={product}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddtoCart}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No products found.</p>
          )}
        </div>
      </div>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}
