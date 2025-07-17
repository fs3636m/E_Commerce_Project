import { Menu } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import BrandSidebar from "./BrandSidebar";
import { Button } from "@/components/ui/button";

function BrandHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* Left: Hamburger Menu (on small screens) */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <BrandSidebar open={open} setOpen={setOpen} />
        </Sheet>
      </div>

      {/* Right: Brand Title */}
      <h1 className="text-lg font-semibold">Brand Dashboard</h1>
    </header>
  );
}

export default BrandHeader;
