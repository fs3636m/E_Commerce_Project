import { useState } from "react";
import AdminSideBar from "./SideBar";
import AdminHeader from "./Header";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  const [open, setOpen] = useState(false); // ✅ sidebar toggle state

  return (
    <div className="flex min-h-screen w-full">
      {/* admin sidebar */}
      <AdminSideBar open={open} setOpen={setOpen} /> {/* ✅ pass state */}
      <div className="flex flex-1 flex-col">
        {/* admin header */}
        <AdminHeader setOpen={setOpen} /> {/* ✅ pass toggle */}
        <main className="flex flex-1 flex-col bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
