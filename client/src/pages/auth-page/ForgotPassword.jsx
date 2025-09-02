// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "@/store/auth/password_Slice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.password);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    console.log("Email being sent:", email);
    const result = await dispatch(forgotPassword(email));
    const payload = result.payload;

    if (payload && payload.success) {
      toast.success(payload.message || "✅ Password reset email sent");
      setEmail("");
    } else {
      toast.error(payload?.message || "Failed to send email");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-xl shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
      <p className="text-center text-gray-500 mb-4 text-sm">
        Enter your email to receive a password reset link
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link
          to="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}
