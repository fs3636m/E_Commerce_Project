import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { getFeaturedBrands, getFeaturedProducts } from "@/store/common_slice";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronDown, ChevronUp, ShoppingCart, User } from "lucide-react";
import { addToCart } from "@/store/shop/cart-slice";
import { toast } from "sonner";

export default function AuthLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  
  const { featuredBrands, featuredProducts, loading, error } = useSelector(
    (state) => state.commonFeature
  );

  useEffect(() => {
    dispatch(getFeaturedBrands());
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.warning("Please login to add items to cart");
      navigate("/auth/login");
      return;
    }

    dispatch(addToCart({
      productId: product._id,
      quantity: 1,
      price: product.price,
      image: product.images?.[0] || product.image,
      title: product.name || product.title
    })).then(() => {
      toast.success("Item added to cart");
    });
  };

  const cartItemCount = cartItems?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Navigation Bar */}
      <nav className="relative z-50 w-full p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <ShoppingCart className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold text-primary">ECommerce</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Shopping Cart */}
          <button 
            onClick={() => user ? navigate("/checkout") : navigate("/auth/login")}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          
          {/* Auth Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors"
            >
              <User className="h-5 w-5" />
              <span>{user ? "Account" : "Login"}</span>
              {showAuthDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAuthDropdown && (
              <div className="absolute right-0 mt-2 w-72 z-50">
                <Card className="shadow-lg border border-gray-200">
                  <CardContent className="p-4">
                    <Outlet />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p>Loading products and brands...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-500">
            <p>Error loading data: {error}</p>
          </div>
        )}

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Store</h2>
          <p className="text-xl text-gray-600 mb-8">Discover amazing products from top brands</p>
        </section>

        {/* Top Brands Section */}
        <section className="max-w-7xl mx-auto mb-12">
          <h3 className="text-2xl font-semibold mb-6">Top Brands</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {featuredBrands?.map((brand) => (
              <Card 
                key={brand._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/brands/${brand._id}`)}
              >
                <CardContent className="flex flex-col items-center p-4">
                  {brand.profilePicture ? (
                    <img
                      src={brand.profilePicture}
                      alt={brand.name || 'Brand logo'}
                      className="w-20 h-20 object-contain mb-3 rounded-full border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-20 h-20 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center mb-3">
                            <User class="h-10 w-10 text-gray-400" />
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center mb-3">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-medium text-center">
                    {brand.name || 'Brand'}
                  </h4>
                  {brand.rating?.average ? (
                    <div className="flex items-center mt-1 text-sm text-yellow-600">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="ml-1">
                        {parseFloat(brand.rating.average).toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">No ratings</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">Featured Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <Card 
                key={product._id} 
                className="hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div 
                    className="aspect-square mb-4 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.images?.[0] || product.image ? (
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name || product.title || 'Product'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingCart class="h-12 w-12" />
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <h4 
                    className="font-medium mb-1 line-clamp-2 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name || product.title || 'Product'}
                  </h4>
                  <div className="flex justify-between items-center mb-3 mt-auto">
                    <span className="font-bold text-lg">
                      ${product.price?.toFixed(2) || "0.00"}
                    </span>
                    {product.rating?.average ? (
                      <div className="flex items-center text-sm text-yellow-600">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span className="ml-1">
                          {parseFloat(product.rating.average).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No ratings</div>
                    )}
                  </div>
                  <button 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>© {new Date().getFullYear()} ECommerce. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}