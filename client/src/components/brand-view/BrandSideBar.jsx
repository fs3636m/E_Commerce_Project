import {
  LayoutDashboard,
  ShoppingBasket,
  UploadCloudIcon,
  UserCircle2,
  LogOut,
  ReceiptPoundSterling,
} from "lucide-react";
import SidebarTemplate from "../common/SideBarTemplate";
import { useNavigate } from "react-router-dom";

export default function BrandSideBar({ open, setOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const brandSidebarMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/brand/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      id: "products",
      label: "Products",
      path: "/brand/products",
      icon: <ShoppingBasket />,
    },
    {
      id: "create-brand",
      label: "Create Brand",
      path: "/brand/create",
      icon: <UploadCloudIcon />,
    },
    {
      id: "profile",
      label: "Profile",
      path: "/brand/profile",
      icon: <UserCircle2 />,

    },
    { 
      id: "sales-report",
      label: "Sales Report",
      path: "/brand/sales-report",
      icon: <ReceiptPoundSterling />,
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut />,
      onClick: handleLogout, // ✅ Will now work correctly
    },
  ];

  return (
    <SidebarTemplate
      open={open}
      setOpen={setOpen}
      menuItems={brandSidebarMenuItems}
      title="Brand Panel"
      navigateTo="/brand/dashboard"
    />
  );
}
