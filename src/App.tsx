// frontend/src/App.tsx (FINAL DEFINITIVE VERSION with Conditional Routing)

import React, { useState, useMemo } from "react";
import { useAppSelector } from "./hooks/useAppHooks";
import { Role } from "./types";

// Importing Components (Ensure paths match your project structure)
import { RoleSelection } from "./components/RoleSelection";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Navbar } from "./components/Navbar";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { LandownerDashboard } from "./components/LandownerDashboard";
import { PestStore } from "./components/PestStore";
import { ProductManagement } from "./components/ProductManagement";
import { CropYieldPredictor } from "./components/CropYieldPredictor";
import { SmartController } from "./components/SmartController";
import { Seo } from "./components/Seo";
import { OrderHistory } from "./components/OrderHistory"; // ✅ NEW: Order History for Farmers

type AuthView = "role-selection" | "login" | "signup";
// Updated AppPage to include all states
type AppPage =
  | "dashboard"
  | "pest-store"
  | "product-management"
  | "order-history" // New state for Farmer's Order History
  | "crop-predictor"
  | "smart-controller";

function App() {
  // 1. Get State from Redux Store
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const profile = user;
  const loading = useAppSelector(
    (state) => state.authApi.queries.login?.status === "pending"
  );

  const [authView, setAuthView] = useState<AuthView>("role-selection");
  const [selectedRole, setSelectedRole] = useState<Role>("farmer");
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed bg-[linear-gradient(rgba(236,253,245,0.92),rgba(236,253,245,0.92)),url('/background.jpg')]">
        <div
          className="rounded-lg bg-white/85 px-6 py-4 text-lg font-semibold text-gray-700 shadow-sm"
          role="status"
          aria-live="polite"
        >
          Loading your experience...
        </div>
      </div>
    );
  }

  // 2. 🎯 Authentication Gate
  if (!isAuthenticated || !profile) {
    if (authView === "role-selection") {
      return (
        <RoleSelection
          onSelectRole={(role) => {
            setSelectedRole(role);
            setAuthView("login");
          }}
        />
      );
    }

    if (authView === "login") {
      return (
        <LoginPage
          role={selectedRole}
          onBack={() => setAuthView("role-selection")}
          onSwitchToSignup={() => setAuthView("signup")}
        />
      );
    }

    return (
      <SignupPage
        role={selectedRole}
        onBack={() => setAuthView("role-selection")}
        onSwitchToLogin={() => setAuthView("login")}
      />
    );
  }

  // 3. Authorized View Rendering
  const roleString = profile.role || "farmer";
  const roleLabel = roleString === "landowner" ? "Landowner" : "Farmer";

  const pageMeta: Record<AppPage, { title: string; description: string }> = {
    dashboard: {
      title: `${roleLabel} Dashboard | Smart Kisan`,
      description: "Track activity.",
    },
    "pest-store": {
      title: "Pest Store | Smart Kisan",
      description: "Shop farm inputs.",
    },
    "product-management": {
      title: "Product Management | Smart Kisan",
      description: "Manage store catalog.",
    },
    "order-history": {
      title: "Order History | Smart Kisan",
      description: "View past orders and tracking information.",
    }, // ✅ NEW META
    "crop-predictor": {
      title: "Crop Yield Predictor | Smart Kisan",
      description: "Forecast yields.",
    },
    "smart-controller": {
      title: "Smart Controller | Smart Kisan",
      description: "Automate irrigation.",
    },
  };

  // Helper function to handle Navbar navigation logic
  const handleNavigation = (page: string) => {
    if (page === "pest-store" && roleString === "landowner") {
      setCurrentPage("product-management");
    } else {
      setCurrentPage(page as AppPage);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900">
      <Seo
        title={pageMeta[currentPage].title}
        description={pageMeta[currentPage].description}
      />

      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 -translate-y-16 transform rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 opacity-0"
      >
        Skip to main content
      </a>

      <Navbar currentPage={currentPage} onNavigate={handleNavigation} />

      <main id="main-content" className="pb-10">
        {/* Dashboard Routing */}
        {currentPage === "dashboard" && (
          <>
            {roleString === "farmer" ? (
              <FarmerDashboard />
            ) : (
              <LandownerDashboard />
            )}

            {/* 🌟 Farmer Dashboard: Add link/section to Order History 🌟 */}
            {/* NOTE: You should add a visible link/button inside FarmerDashboard.tsx 
                           that calls setCurrentPage('order-history') */}
          </>
        )}
        {/* 🌟 Conditional Store Rendering 🌟 */}
        {currentPage === "pest-store" && roleString === "farmer" && (
          <PestStore />
        )}
        {currentPage === "product-management" && roleString === "landowner" && (
          <ProductManagement />
        )}
        {currentPage === "pest-store" && roleString === "landowner" && (
          <ProductManagement />
        )}{" "}
        {/* Fallback */}
        {/* 🌟 NEW: Order History Screen (Accessed by Farmer) 🌟 */}
        {currentPage === "order-history" && roleString === "farmer" && (
          <OrderHistory />
        )}
        {/* Other Modules */}
        {currentPage === "crop-predictor" && <CropYieldPredictor />}
        {currentPage === "smart-controller" && <SmartController />}
      </main>
    </div>
  );
}

export default App;
