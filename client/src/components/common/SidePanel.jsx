import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import { ChartNoAxesCombined } from "lucide-react"; // same icon for now

function SidePanelLayout({ panelTitle, menuItems, open, setOpen }) {
  const navigate = useNavigate();

  const MenuItems = () => (
    <nav className="mt-8 flex-col flex gap-2">
      {menuItems.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            navigate(item.path);
            if (setOpen) setOpen(false);
          }}
          className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );

  return (
    <Fragment>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mt-5 mb-5">
                <ChartNoAxesCombined size={30} />
                <div className="text-2xl font-extrabold">{panelTitle}</div>
              </SheetTitle>
            </SheetHeader>
            <MenuItems />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <div
          onClick={() => navigate(menuItems[0]?.path || "/")}
          className="flex cursor-pointer items-center gap-2"
        >
          <ChartNoAxesCombined size={30} />
          <h1 className="text-2xl font-extrabold">{panelTitle}</h1>
        </div>
        <MenuItems />
      </aside>
    </Fragment>
  );
}

export default SidePanelLayout;
