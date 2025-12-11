// frontend/src/components/Navbar.tsx (FINAL VERSION - With Order History Link)

import React from "react";
import {
  Sprout,
  Store,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  Cpu,
  ClipboardList, // New icon for Order History
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/useAppHooks";
import { logout } from "../features/auth/authSlice";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user: profile } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const handleSignOut = () => {
    dispatch(logout());
  };

  const roleString = profile?.role || "farmer";

  // Determine the appropriate link/page key for the Store button based on role
  const storePageKey =
    roleString === "landowner" ? "product-management" : "pest-store";

  // Helper to determine active state for the Store/Management button
  const isStoreActive =
    currentPage === "pest-store" || currentPage === "product-management";

  // Helper to check if the current page is Order History
  const isOrderHistoryActive = currentPage === "order-history";

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Primary Row */}
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">
                Smart Kisan
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === "dashboard"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              {/* 🌟 ORDER HISTORY LINK (FARMER ONLY) 🌟 */}
              {roleString === "farmer" && (
                <button
                  onClick={() => onNavigate("order-history")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isOrderHistoryActive
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
              )}

              {/* CONDITIONAL STORE/MANAGEMENT BUTTON */}
              <button
                onClick={() => onNavigate(storePageKey)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isStoreActive
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Store className="w-5 h-5" />
                <span>
                  {roleString === "landowner"
                    ? "Product Management"
                    : "Pest Store"}
                </span>
              </button>

              <button
                onClick={() => onNavigate("crop-predictor")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === "crop-predictor"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Crop Yield Predictor</span>
              </button>

              <button
                onClick={() => onNavigate("smart-controller")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === "smart-controller"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Cpu className="w-5 h-5" />
                <span>Smart Controller</span>
              </button>
            </div>
          </div>

          {/* Profile Info and Sign Out Button */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex space-x-2 pb-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPage === "dashboard"
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
          </button>

          {/* 🌟 MOBILE ORDER HISTORY LINK (FARMER ONLY) 🌟 */}
          {roleString === "farmer" && (
            <button
              onClick={() => onNavigate("order-history")}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                isOrderHistoryActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ClipboardList className="w-4 h-4" /> <span>Orders</span>
            </button>
          )}

          <button
            onClick={() => onNavigate(storePageKey)}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              isStoreActive
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Store className="w-4 h-4" />{" "}
            <span>{roleString === "landowner" ? "Manage" : "Store"}</span>
          </button>

          <button
            onClick={() => onNavigate("crop-predictor")}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPage === "crop-predictor"
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> <span>Predictor</span>
          </button>

          <button
            onClick={() => onNavigate("smart-controller")}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPage === "smart-controller"
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Cpu className="w-4 h-4" /> <span>Controller</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
