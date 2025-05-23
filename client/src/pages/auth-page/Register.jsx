import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CommonForm from "@/components/common/Form";
import { registerFormControls } from "@/config/Index";
import { registerUser } from "@/store/auth-slice";
import { toast } from "sonner";

const AuthRegister = () => {
  const [formData, setFormData] = useState({
    userName: "",
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
      const actionResult = await dispatch(registerUser(formData));
      const { success, message } = actionResult.payload || {};

      if (success) {
        toast.success(message || "Registration successful!");
        navigate("/auth/login", {
          state: { 
            prefillEmail: formData.email,
            from: "register" 
          }
        });
      } else {
        toast.error(message || "Registration failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={isLoading ? "Creating Account..." : "Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </div>
  );
};

export default AuthRegister;