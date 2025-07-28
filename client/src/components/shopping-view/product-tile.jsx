import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config/Index";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const displayBrand =
    typeof product.brand === "string"
      ? brandOptionsMap[product.brand] || product.brand
      : product.brand?.name || "Unknown Brand";

  const displayCategory =
    categoryOptionsMap[product.category] || product.category || "Unknown";

  return (
    <Card className="w-full h-full flex flex-col justify-between rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
      <div
        onClick={() => handleGetProductDetails(product._id)}
        className="cursor-pointer"
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[355px] object-cover rounded-t-xl"
          />

          {/* Stock + Sale Badges */}
          {product.totalStock === 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          )}
          {product.totalStock > 0 && product.totalStock < 10 && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              Only {product.totalStock} left
            </Badge>
          )}
          {product.salePrice > 0 && (
            <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
              On Sale
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 truncate">
            {product.title}
          </h2>

          <div className="flex flex-wrap gap-2 justify-between text-base md:text-lg font-medium text-gray-800">
            <span className="capitalize">{displayCategory}</span>
            <span className="capitalize">{displayBrand}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-lg md:text-xl font-semibold ${
                product.salePrice > 0
                  ? "line-through text-gray-400"
                  : "text-gray-900"
              }`}
            >
              ${product.price}
            </span>

            {product.salePrice > 0 && (
              <span className="text-lg md:text-xl font-bold text-primary">
                ${product.salePrice}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4">
        <Button
          onClick={() => handleAddtoCart(product._id, product.totalStock)}
          disabled={product.totalStock === 0}
          className={`w-full py-3 text-base md:text-lg ${
            product.totalStock === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {product.totalStock === 0 ? "Out Of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
