import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginNavbar from "./components/LoginNavbar";

import Home from "./pages/Landing";
import LoginForm from "./pages/LoginForm";
import CreateAccount from "./pages/CreateAccount";
import OwnerDashboard from "./pages/owner/dashboard/OwnerDashboard";
import SitterDashboard from "./pages/sitter/dashboard/SitterDashboard";
import Booking from "./pages/owner/Booking";
import Profile from "./pages/owner/Profile";

import API from "./api/api";

// Helper to get the correct dashboard based on user role
const getUserDashboard = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData.role === "OWNER") return "/owner/dashboard";
      if (userData.role === "SITTER") return "/sitter/dashboard";
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  return "/dashboard";
};

const AppContent = () => {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Only check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    API.get("profiles/owners/me/")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        // Token invalid → remove it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  // Show nothing while checking token
  if (checkingAuth) return null;

  // Navbar logic
  const dashboardPrefixes = [
    "/dashboard",
    "/booking",
    "/messages",
    "/profile",
    "/owner",
    "/sitter",
  ];
  const showDashboardNav = dashboardPrefixes.some((p) =>
    pathname.startsWith(p)
  );
  const hideNavbar = ["/login", "/create-account"].includes(pathname);

  const Protected = (element) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <>
      {!hideNavbar && (showDashboardNav ? <LoginNavbar /> : <Navbar />)}

      <Routes>
        {/* Landing page is always "/" */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route
          path="/login"
          element={
            <LoginForm
              onLogin={() => setIsAuthenticated(true)} // update state after login
            />
          }
        />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected pages */}
        <Route path="/dashboard" element={Protected(<OwnerDashboard />)} />
        <Route
          path="/owner/dashboard"
          element={Protected(<OwnerDashboard />)}
        />
        <Route
          path="/sitter/dashboard"
          element={Protected(<SitterDashboard />)}
        />
        <Route path="/booking" element={Protected(<Booking />)} />
        <Route path="/profile" element={Protected(<Profile />)} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
