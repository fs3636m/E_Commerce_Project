import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBrands, deleteBrand } from "@/store/admin/brand_admin_slice"; // use deleteBrand
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBrands() {
  const dispatch = useDispatch();
  const { brands, isLoading, error } = useSelector((state) => state.adminBrands);

  useEffect(() => {
    dispatch(fetchAllBrands());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      dispatch(deleteBrand(id));
    } else {
      toast.info("❌ Brand deletion cancelled");
    }
  };

  if (isLoading) return <p className="p-4">Loading brands...</p>;
  if (error) return <p className="p-4 text-red-500">❌ {error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Brands</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Card key={brand._id} className="p-4 space-y-2">
            <img
              src={brand.profilePicture || "/placeholder.jpg"}
              alt={brand.name}
              className="w-full h-32 object-cover rounded-md"
            />
            <h2 className="text-lg font-semibold">{brand.name}</h2>
            <p className="text-sm text-muted-foreground">
              {brand.bio?.slice(0, 80) || "No bio"}
            </p>

            <Button
              variant="destructive"
              className="w-full mt-2"
              onClick={() => handleDelete(brand._id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Brand
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
