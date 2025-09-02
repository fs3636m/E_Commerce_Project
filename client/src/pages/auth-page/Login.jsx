import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import CommonForm from "@/components/common/Form";
import { LoginFormControls } from "@/config/Index";
import { loginUser } from "@/store/auth-slice";

const AuthLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const actionResult = await dispatch(loginUser(formData));
      const { success, message, user } = actionResult.payload || {};

      if (success) {
        toast.success(message);
        // Redirect based on user role
        navigate(user?.role === "admin" ? "/admin/dashboard" : "/shop/home");
      } else {
        toast.error(message || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your Account
        </h1>
        <p className="mt-2">
          Don't have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={LoginFormControls}
        buttonText={isLoading ? "Signing In..." : "Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
       {/* Forgot Password Link */}
      <p className="text-sm text-center text-gray-600 mt-2">
        Forgot your password?{" "}
        <Link
          to="/auth/forgot-password"
          className="text-blue-500 hover:underline"
        >
          Reset it here
        </Link>
      </p>
    </div>
  );
};

export default AuthLogin;