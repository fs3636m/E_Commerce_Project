import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, lazy, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import CheckAuth from "./components/common/CheckAuth";
import { checkAuth } from "./store/auth-slice";

// Layouts
const AuthLayout = lazy(() => import("./components/auth-component/Layout"));
const AdminLayout = lazy(() => import("./components/admin-view/Layout"));
const ShoppingLayout = lazy(() => import("./components/shopping-view/Layout"));
const BrandLayout = lazy(() => import("./components/brand-view/BrandLayout"));


// Auth Pages
const AuthLogin = lazy(() => import("./pages/auth-page/Login"));
const AuthRegister = lazy(() => import("./pages/auth-page/Register"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin-view/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/Product"));
const AdminOrders = lazy(() => import("./pages/admin-view/Orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/Features"));
const AdminBrands = lazy(() => import("./pages/admin-view/AdminBrands"));

// Shopping Pages
const ShoppingHome = lazy(() => import("./pages/shopping-view/Home"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/Listing"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/Checkout"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/Account"));
const PaypalReturnPage = lazy(() => import("./pages/shopping-view/paypal_return"));
const PaymentSuccessPage = lazy(() => import("./pages/shopping-view/payment_success"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));
const ProductDetailsPage = lazy(() => import("./components/shopping-view/product-details"));

// Brand (Logged-in) Pages
const BrandDashboard = lazy(() => import("./pages/brand-view/BrandDashboard"));
const BrandProducts = lazy(() => import("./pages/brand-view/BrandProducts"));
const BrandForm = lazy(() => import("./pages/brand-view/BrandForm"));
const BrandProfilePage = lazy(() => import("./pages/brand-view/BrandProfilePage"));
const BrandOrdersView = lazy(() => import("./pages/brand-view/BrandOrdersView"));

// Public Brand Pages
const BrandListingPage = lazy(() => import("./pages/shopping-view/BrandListingPage"));
const BrandPublicProfile = lazy(() => import("./pages/brand-view/BrandPublicProfile"));

const NotFound = lazy(() => import("./pages/not-found/Index"));
const UnauthPage = lazy(() => import("./pages/unauth-page/Index"));

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    dispatch(checkAuth(token));
  }, [dispatch]);

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <Routes>
          {/* ✅ Redirect root based on user role */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? user?.role === "admin"
                      ? "/admin/dashboard"
                      : "/shop/home"
                    : "/auth/login"
                }
              />
            }
          />

          {/* ✅ Public Routes */}
          <Route path="/brands" element={<BrandListingPage />} />
          <Route path="/brands/:brandId" element={<BrandPublicProfile />} />
         

          

          {/* 🔐 Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          {/* 🔐 Admin Routes */}
          <Route
            path="/admin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </CheckAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="brands" element={<AdminBrands />} />
          </Route>

          {/* 🔐 Shopping Routes */}
          <Route
            path="/shop"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <ShoppingLayout />
              </CheckAuth>
            }
          >
            <Route path="home" element={<ShoppingHome />} />
            <Route path="listing" element={<ShoppingListing />} />
            <Route path="checkout" element={<ShoppingCheckout />} />
            <Route path="account" element={<ShoppingAccount />} />
            <Route path="paypal-return" element={<PaypalReturnPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="search" element={<SearchProducts />} />
            <Route path="products/:productId" element={<ProductDetailsPage />} />


          </Route>

          {/* 🔐 Brand Routes */}
          <Route
            path="/brand"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                {user?.role === "brand" ? (
                  <BrandLayout />
                ) : (
                  <Navigate to="/unauth-page" />
                )}
              </CheckAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<BrandDashboard />} />
            <Route path="products" element={<BrandProducts />} />
            <Route path="profile" element={<BrandProfilePage />} />
            <Route path="create" element={<BrandForm />} />
            <Route path="orders" element={<BrandOrdersView />} />
            <Route path="products/:productId/edit" element={<BrandForm />} />
            <Route path="edit-profile" element={<BrandProfilePage />} /> 
            <Route path="upload-product" element={<BrandForm />} />



          </Route>

          {/* Misc */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
