import { useLocation, Navigate } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isShopRoute = location.pathname.startsWith('/shop');

  // 1. Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isAuthRoute) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    const redirectPath = user?.role === "admin" 
      ? "/admin/dashboard" 
      : "/shop/home";
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Admin role validation
  if (isAuthenticated) {
    // Non-admin trying to access admin routes
    if (isAdminRoute && user?.role !== "admin") {
      return <Navigate to="/unauth-page" replace />;
    }
    // Admin trying to access shop routes (if you want to restrict this)
    if (isShopRoute && user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // 4. All checks passed - render the content
  return children;
}

export default CheckAuth;