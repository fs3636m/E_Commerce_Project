import { ChartNoAxesCombined } from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function MenuItems({ setOpen, menuItems }) {
  const navigate = useNavigate();
  const location = useLocation();

   return (
    <nav className="mt-8 flex-col flex gap-2">
      {menuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => {
            if (menuItem.onClick) {
              menuItem.onClick(); // ✅ run logout or any custom logic
            } else if (menuItem.path) {
              navigate(menuItem.path);
            }
            if (setOpen) setOpen(false); // ✅ close mobile sheet if needed
          }}
          className={`flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 
            ${location.pathname === menuItem.path
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"}
          `}
        >
          {menuItem.icon}
          <span>{menuItem.label}</span>
        </div>
      ))}
    </nav>
  );
}

export default function SidebarTemplate({
  open,
  setOpen,
  menuItems,
  title = "Dashboard",
  icon = <ChartNoAxesCombined size={30} />,
  navigateTo = "/",
}) {
  const navigate = useNavigate();

  return (
    <Fragment>
      {/* Mobile Sidebar Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                {icon}
                <div className="text-2xl font-extrabold">{title}</div>
              </SheetTitle>
            </SheetHeader>
            <MenuItems menuItems={menuItems} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div
          onClick={() => navigate(navigateTo)}
          className="flex cursor-pointer items-center gap-2"
        >
          {icon}
          <h1 className="text-2xl font-extrabold">{title}</h1>
        </div>
        <MenuItems menuItems={menuItems} />
      </aside>
    </Fragment>
  );
}
