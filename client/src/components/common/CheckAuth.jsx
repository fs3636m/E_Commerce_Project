import { useLocation, Navigate } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, isLoading, children }) {
  const location = useLocation();

  // Add loading state check to prevent flash of redirects
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // Define route types
  const isAuthRoute = location.pathname.startsWith("/auth");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isShopRoute = location.pathname.startsWith("/shop");
  const isBrandRoute = location.pathname.startsWith("/brands");

  // 1. Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && !isAuthRoute) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    const redirectPath =
      user?.role === "admin" ? "/admin/dashboard" : "/shop/home";
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Role-based authorization
  if (isAuthenticated) {
    // Non-admin trying to access admin routes
    if (isAdminRoute && user?.role !== "admin") {
      return <Navigate to="/unauth-page" replace />;
    }
    // Admin trying to access shop routes (optional restriction)
    if (isShopRoute && user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isAdminRoute && user?.role === "brand") {
      return <Navigate to="/brands/dashboard" replace />;
    }
  }

  // 4. All checks passed - render the protected content
  return children;
}

export default CheckAuth;
