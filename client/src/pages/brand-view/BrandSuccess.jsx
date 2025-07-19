import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function BrandSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Brand Created Successfully!</h1>
      <p className="text-muted-foreground mb-6">
        Your brand profile is live. You can now start uploading your products.
      </p>
      <Button asChild>
        <Link to="/brand/dashboard">Go to Brand Dashboard</Link>
      </Button>
    </div>
  );
}
