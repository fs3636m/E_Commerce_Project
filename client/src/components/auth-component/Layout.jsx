import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  getHomepageBrands,
  getHomepageProducts,
} from "@/store/shop/feature_slice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroBanner from "@/assets/maxresdefault.jpg";

const HomeLayout = () => {
  const categoryList = ["Footwear", "Perfume", "Watches", "Accessories"];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const { homepageBrands = [], homepageProducts = [] } = useSelector(
    (state) => state.homepageFeature
  );

  useEffect(() => {
    dispatch(getHomepageBrands());
    dispatch(getHomepageProducts());

    const dataInterval = setInterval(() => {
      dispatch(getHomepageBrands());
      dispatch(getHomepageProducts());
    }, 5 * 60 * 1000);

    const categoryInterval = setInterval(() => {
      setVisibleIndex((prevIndex) => (prevIndex + 1) % categoryList.length);
    }, 1500);

    return () => {
      clearInterval(dataInterval);
      clearInterval(categoryInterval);
    };
  }, [dispatch]);

  const toggleAccount = () => {
    setAccountOpen((prev) => !prev);
  };
  const handleRegisterClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // ⬆️ scroll to top
    navigate("/auth/register"); // 🔓 navigate to trigger modal via <Outlet />
  };
  const handleGetStarted = () => {
  window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
  navigate("/auth/register"); // Open the modal via Outlet route
};

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm sticky top-0 z-20">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          ECommerce
        </Link>

        <div className="relative">
          <Button onClick={toggleAccount}>Account</Button>
          {accountOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg z-50 p-4">
              <Outlet />
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative w-full h-[400px]">
        <img
          src={heroBanner}
          alt="Shop Banner"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Top Brands
          </h1>
          <p className="text-lg max-w-xl">
            Shop from your favorite verified brands. Quality you trust, all in
            one place.
          </p>
          <div
            onClick={handleGetStarted}
            className="mt-6 inline-block rounded-xl bg-primary text-white text-lg px-6 py-3 shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer"
          >
            Get Started
          </div>
        </div>
      </section>

      {/* Headline */}
      <section className="text-center mb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Shop Top Brands Now
        </h1>
      </section>

      {/* Become Verified Brand CTA */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-100 py-10 mb-12 rounded-md shadow-sm mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Own a Brand?</h2>
            <p className="text-gray-600">
              Get verified and start selling your products today.{" "}
              <span
                onClick={() => setShowEmailPopup(true)}
                className="text-primary underline cursor-pointer"
              >
                Contact us to get verified
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Email Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <p className="text-gray-700 mb-4">
              Email us at:{" "}
              <a
                href="mailto:Sheriffdeenolayemi898@gmail.com"
                className="text-primary underline"
              >
                Sheriffdeenolayemi898@gmail.com
              </a>
            </p>
            <Button variant="outline" onClick={() => setShowEmailPopup(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-20">
        {/* Categories */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Explore Categories
          </h2>
          <div className="flex justify-center">
            {categoryList.map((cat, index) => (
              <div
                key={cat}
                className={`transition-opacity duration-1000 ease-in-out px-6 py-3 rounded-lg shadow-md bg-gray-100 text-lg font-medium text-gray-700 mx-2 ${
                  index === visibleIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                {cat}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Brands */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Top Brands
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {homepageBrands.map((brand) => (
              <Link key={brand._id} to={`/brands/${brand._id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={brand.profilePicture || "/placeholder-brand.svg"}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-md font-medium text-center">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">No ratings</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Featured Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {homepageProducts.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="aspect-square mb-4 overflow-hidden rounded">
                      <img
                        src={product.image || "/placeholder-product.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-md font-semibold mt-2">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-gray-50 p-6 rounded-lg shadow text-center max-w-3xl mx-auto">
          <p className="italic text-lg text-gray-700">
            “The best online shopping experience. Quality brands and fast
            delivery.”
          </p>
          <div className="mt-3 text-sm text-gray-600">
            &ndash; Happy Customer
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <h3 className="text-xl font-bold mb-2">Ready to start shopping?</h3>
          <Button className="text-lg" onClick={handleRegisterClick}>
            Create an Account
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">ECommerce</h3>
            <p className="text-sm">
              Your trusted place to shop quality products from verified brands.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/brands">Brands</Link>
              </li>
              <li>
                <Link to="/shop/home">Home</Link>
              </li>
              <li>
                <Link to="/search">Search</Link>
              </li>
              <li>
                <Link to="/auth/login">Login</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Support</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq">FAQs</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                Facebook
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} ECommerce. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;
