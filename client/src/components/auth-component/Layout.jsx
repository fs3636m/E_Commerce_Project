import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHomepageBrands, getHomepageProducts } from "@/store/shop/feature_slice";
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AuthLayout = () => {
  const dispatch = useDispatch();

  const { homepageBrands = [], homepageProducts = [] } = useSelector(
    (state) => state.homepageFeature
  );

  const { userInfo } = useSelector((state) => state.auth);

  const greeting = userInfo?.name ? `Hey, ${userInfo.name} 👋` : "Welcome to Our Store";

  useEffect(() => {
    dispatch(getHomepageBrands());
    dispatch(getHomepageProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          ECommerce
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/auth/register" className="hidden sm:block">
            <Button variant="ghost">Register</Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" className="bg-white hover:bg-gray-50">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Hero Section with Greeting */}
        <section className="text-center mb-12 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {greeting}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing products from top brands
          </p>
        </section>

        {/* Featured Brands */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Top Brands</h2>
            <Link to="/brands" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {homepageBrands.map((brand) => (
              <Link to={`/brands/${brand._id}`} key={brand._id}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={brand.profilePicture || "/placeholder-brand.svg"}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-md font-medium text-center">{brand.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">No ratings</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-12"></div>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Featured Products</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {homepageProducts.map((product) => (
              <Link to={`/products/${product._id}`} key={product._id}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="aspect-square mb-4 overflow-hidden rounded">
                      <img
                        src={product.image || "/placeholder-product.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                    <p className="text-md font-semibold mt-2">₦{product.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Layer (Login/Register) */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
