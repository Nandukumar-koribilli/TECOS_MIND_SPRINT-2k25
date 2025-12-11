// frontend/src/components/SignupPage.tsx

import React, { useState, FormEvent } from "react";
import { ArrowLeft, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSignupMutation } from "../api/authApi";
import { useAppSelector } from "../hooks/useAppHooks";
import { Role as UserRole } from "../types";

interface SignupPageProps {
  role: UserRole;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  role,
  onBack,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const [signup, { isLoading, error }] = useSignupMutation();
  const { isAuthenticated, user: userProfile } = useAppSelector(
    (state) => state.auth
  );

  const errorMessage = error
    ? (error as any).data?.detail ||
      "An unexpected error occurred during signup."
    : "";

  const navigateToDashboard = (userRole: UserRole) => {
    if (userRole === "admin") navigate("/admin/dashboard");
    else if (userRole === "landowner") navigate("/landowner/dashboard");
    else navigate("/farmer/dashboard");
  };

  // Auto-Redirect Check (Activated after successful auto-login from the mutation)
  if (isAuthenticated && userProfile) {
    navigateToDashboard(userProfile.role);
    return null;
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Sends all mandatory fields to the backend (full_name, email, password, role, phone)
      await signup({
        email,
        password,
        full_name: fullName,
        role,
        phone,
      }).unwrap();

      // Auto-login succeeds; redirection is handled above.
    } catch (err) {
      console.error("Signup failed in component:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
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
            Create {role === "farmer" ? "Farmer" : "Landowner"} Account
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Join Smart Kisan today
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name (Mandatory) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Phone Number (Mandatory, matches backend schema) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="e.g., 9980123456"
                required
              />
            </div>

            {/* Email Address (Mandatory) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password (Mandatory) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
