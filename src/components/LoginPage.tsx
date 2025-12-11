// frontend/src/components/LoginPage.tsx (FINAL REDUX/RTK QUERY VERSION)

import React, { useState, FormEvent } from "react";
import { ArrowLeft, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ REDUX/RTK QUERY IMPORTS (Replacing useAuth)
import { useAppSelector } from "../hooks/useAppHooks";
import { useLoginMutation } from "../api/authApi";
import { Role as UserRole } from "../types";

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  role,
  onBack,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 1. RTK QUERY HOOK: Manages async login, loading, and error states
  const [login, { isLoading, error }] = useLoginMutation();

  // 2. REDUX SELECTOR: Monitors authentication status for auto-redirection
  const { isAuthenticated, user: userProfile } = useAppSelector(
    (state) => state.auth
  );

  // Helper to format the error message from RTK Query (matches your backend format)
  const errorMessage = error
    ? (error as any).data?.detail || "An unexpected server error occurred."
    : "";

  const navigateToDashboard = (userRole: UserRole) => {
    if (userRole === "admin") navigate("/admin/dashboard");
    else if (userRole === "landowner") navigate("/landowner/dashboard");
    else navigate("/farmer/dashboard");
  };

  // 3. Auto-Redirect Check (Activated immediately after successful login)
  if (isAuthenticated && userProfile) {
    navigateToDashboard(userProfile.role);
    return null;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Executes the API call, sending email, password, and the selected role
      await login({ email, password, role }).unwrap();
      // Success: Redux state updates, and the redirection check above handles navigation.
    } catch (err) {
      // Error handling is managed by the 'error' state from the mutation hook
      console.error("Login failed in component:", err);
    }
  };

  return (
    // UI Structure and Tailwind Styling Preserved
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4"
      // Assuming you have /background.jpg in your public folder
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to role selection
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {role === "farmer" ? "Farmer" : "Landowner"} Login
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your dashboard
          </p>

          {/* Error Display Area */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
