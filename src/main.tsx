// frontend/src/main.tsx (or index.tsx)

import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Assuming you use Router
import { Provider } from "react-redux"; // 🌟 1. NEW: Import Redux Provider 🌟
import { store } from "./app/store"; // 🌟 2. NEW: Import the Redux Store 🌟

// import { AuthProvider } from './contexts/AuthContext'; // ❌ REMOVE THIS LINE (Replaced by Redux)
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 🌟 3. FIX: Replace AuthProvider with Redux Provider 🌟 */}
    <Provider store={store}>
      {/* It's best practice to put the Router here if your App.tsx uses Routes */}
      <Router>
        <App />
      </Router>
    </Provider>
  </StrictMode>
);
