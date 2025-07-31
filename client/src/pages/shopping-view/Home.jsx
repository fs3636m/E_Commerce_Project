import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  BabyIcon,
  GlassesIcon,
  ShirtIcon,
  WatchIcon,
  UmbrellaIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBasket,
  Camera
} from "lucide-react";
import { useLocation } from "react-router-dom";
import AIAssistant from "@/components/AIAssistant";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";

import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products_slice";
import { getFeatureImages } from "@/store/common_slice";
import { fetchAllBrands } from "@/store/shop/brand_slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { toast } from "sonner";


function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const {
    brandList = [],
    loading: brandLoading,
    error: brandError,
  } = useSelector((state) => state.brand || {});


  const staticCategories = [
    { id: "men", label: "Men", icon: ShirtIcon },
    { id: "women", label: "Women", icon: GlassesIcon },
    { id: "kids", label: "Kids", icon: BabyIcon },
    { id: "accessories", label: "Accessories", icon: WatchIcon },
    { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
    { id: "perfume", label: "Perfume", icon: WatchIcon },
    { id: "Unisex", label: "Unisex", icon: Camera },
  ];

  const brandCategories = brandList.map((brand) => ({
    id: brand._id,
    label: brand.name,
    icon: ShoppingBasket,
    type: "brand",
  }));

  const categoriesWithIcon = [...staticCategories, ...brandCategories];

  useEffect(() => {
    dispatch(fetchAllBrands());
    dispatch(getFeatureImages());
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    if (!Array.isArray(featureImageList) || featureImageList.length === 0)
      return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [featureImageList]);

  const handleNavigateToListingPage = (item, section) => {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem("filters", JSON.stringify({ [section]: [item.id] }));
    navigate(`/shop/listing`);
  };

  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  const handleAddToCart = (productId) => {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then(
      (res) => {
        if (res?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast("Product is added to cart");
        }
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔄 Carousel */}
      <div className="relative w-full h-[40vh] md:h-[60vh] lg:h-[80vh] overflow-hidden">
        {(featureImageList || []).map((slide, index) => (
          <img
            key={index}
            src={slide?.image}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            alt={`slide-${index}`}
          />
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + (featureImageList?.length || 1)) %
                (featureImageList?.length || 1)
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % (featureImageList?.length || 1)
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* 📂 Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((item) => (
              <Card
                key={item.id}
                onClick={() =>
                  item.type === "brand"
                    ? navigate(`/brands/${item.id}`)
                    : handleNavigateToListingPage(item, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <item.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold text-center">{item.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🛒 Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(productList || []).map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
      <AIAssistant />
    </div>
  );
}

export default ShoppingHome;
