// src/pages/admin/AdminBrands.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBrands } from "@/store/shop/brand_slice"; // ✅ Use your existing thunk
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Skeleton from "react-loading-skeleton";

export default function AdminBrands() {
  const dispatch = useDispatch();

  const { brands, loading } = useSelector((state) => state.brand); // ✅ Adjust if your state is shaped differently

  useEffect(() => {
    dispatch(fetchAllBrands());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brands</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={100} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brands?.length > 0 ? (
  brands.map((brand) => (
    <Card key={brand._id}>
      <CardContent className="p-4 space-y-2">
        <div className="text-lg font-semibold">{brand.name}</div>
        {brand.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-20 object-contain"
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Edit
          </Button>
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  ))
) : (
  <p className="text-muted-foreground">No brands found.</p>
)}
        </div>
      )}
    </div>
  );
}
