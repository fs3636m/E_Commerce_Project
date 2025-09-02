import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // icons
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/auth/password_Slice";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { isLoading } = useSelector((state) => state.password);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("All fields are required");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    const result = await dispatch(resetPassword({ token, password }));

    if (result.payload?.success) {
      toast.success(result.payload.message);
      navigate("/auth/login");
    } else {
      toast.error(result.payload?.message || result.error?.message || "Failed to reset password");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-xl shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}
