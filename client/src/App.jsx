import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, lazy, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import CheckAuth from "./components/common/CheckAuth";
import { checkAuth } from "./store/auth-slice";

// Lazy-loaded components
const AuthLayout = lazy(() => import("./components/auth-component/Layout"));
const AdminLayout = lazy(() => import("./components/admin-view/Layout"));
const ShoppingLayout = lazy(() => import("./components/shopping-view/Layout"));

// Auth Pages
const AuthLogin = lazy(() => import("./pages/auth-page/Login"));
const AuthRegister = lazy(() => import("./pages/auth-page/Register"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin-view/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/Product"));
const AdminOrders = lazy(() => import("./pages/admin-view/Orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/Features"));

// Shopping Pages
const ShoppingHome = lazy(() => import("./pages/shopping-view/Home"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/Listing"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/Checkout"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/Account"));
const PaypalReturnPage = lazy(() => import("./pages/shopping-view/paypal_return"));
const PaymentSuccessPage = lazy(() => import("./pages/shopping-view/payment_success"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));

// Misc
const NotFound = lazy(() => import("./pages/not-found/Index"));
const UnauthPage = lazy(() => import("./pages/unauth-page/Index"));

function App() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <Routes>
          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? 
                (user?.role === 'admin' ? '/admin/dashboard' : '/shop/home') : 
                '/auth/login'
              } 
              />
            } 
          />

          {/* Public Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          {/* Protected Admin Routes */}
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
          </Route>

          {/* Protected Shop Routes */}
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
          </Route>

          {/* Misc Routes */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;