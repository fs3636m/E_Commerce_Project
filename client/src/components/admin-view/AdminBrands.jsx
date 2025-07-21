import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBrands, deleteBrand } from "@/store/admin/admin_brand_slice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Pagination from "@/components/ui/pagination";

export default function AdminBrands() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const { brands, isLoading, error, pagination } = useSelector((state) => state.adminBrands);

  useEffect(() => {
    dispatch(fetchAllBrands({ page: currentPage, limit: 9 })); // 3x3 grid
  }, [dispatch, currentPage]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this brand? This action cannot be undone.")) {
      await dispatch(deleteBrand(id));
      // Refresh the list if we're on the last page and it's now empty
      if (brands.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      toast.info("Brand deletion cancelled");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500 text-center">
      ❌ {error}
      <Button 
        onClick={() => dispatch(fetchAllBrands({ page: currentPage }))}
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brand Management</h2>
        <span className="text-sm text-gray-500">
          Showing {brands.length} of {pagination.totalBrands} brands
        </span>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No brands found</p>
          <Button 
            onClick={() => dispatch(fetchAllBrands({ page: 1 }))}
            className="mt-4"
          >
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <Card key={brand._id} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={brand.profilePicture || "/placeholder-brand.jpg"}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-brand.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {brand.bio || "No description available"}
                    </p>
                    {brand.owner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Owner: {brand.owner.name || brand.owner.email}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDelete(brand._id)}
                    className="absolute top-2 right-2"
                    variant="destructive"
                    size="icon"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}