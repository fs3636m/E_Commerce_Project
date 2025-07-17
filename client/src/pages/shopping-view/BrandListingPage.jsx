import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BrandListingPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/brands/all`);
        setBrands(res.data.brands);
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">All Brands</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <p>No brands found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Link to={`/brands/${brand._id}`} key={brand._id}>
              <Card className="hover:shadow-lg transition">
                <CardContent className="p-4">
                  <img
                    src={brand.profilePicture}
                    alt={brand.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h3 className="text-lg font-semibold">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{brand.bio}</p>
                  <p className="text-sm mt-1">
                    ⭐ {brand.rating?.average?.toFixed(1) || 0} / 5 (
                    {brand.rating?.totalRatings || 0} ratings)
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandListingPage;
