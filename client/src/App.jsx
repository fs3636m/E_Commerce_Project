import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, lazy, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import CheckAuth from "./components/common/CheckAuth";
import { checkAuth } from "./store/auth-slice";

// Layouts
const AuthLayout = lazy(() => import("./components/auth-component/layout"));
const AdminLayout = lazy(() => import("./components/admin-view/layout"));
const ShoppingLayout = lazy(() => import("./components/shopping-view/layout"));

// Auth Pages
const AuthLogin = lazy(() => import("./pages/auth-page/Login"));
const AuthRegister = lazy(() => import("./pages/auth-page/Register"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin-view/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/Product"));
const AdminOrders = lazy(() => import("./pages/admin-view/Orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/features"));

// Shopping Pages
const ShoppingHome = lazy(() => import("./pages/shopping-view/home"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/listing"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/checkout"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/account"));
const PaypalReturnPage = lazy(() => import("./pages/shopping-view/paypal_return"));
const PaymentSuccessPage = lazy(() => import("./pages/shopping-view/payment_success"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));

// Misc
const NotFound = lazy(() => import("./pages/not-found"));
const UnauthPage = lazy(() => import("./pages/unauth-page"));

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[900px] bg-black h-[600px]" />;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Suspense fallback={<Skeleton className="w-full h-screen" />}>
        <Routes>
          <Route
            path="/"
            element={<CheckAuth isAuthenticated={isAuthenticated} user={user} />}
          />
          <Route
            path="/auth"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AuthLayout />
              </CheckAuth>
            }
          >
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>
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
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
