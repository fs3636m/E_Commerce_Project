import { Outlet } from "react-router-dom";
import BrandSideBar from "./BrandSideBar";
import BrandHeader from "./BrandHeader";

const BrandLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <BrandSideBar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <BrandHeader />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BrandLayout;
