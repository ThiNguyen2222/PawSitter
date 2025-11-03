import React from "react";
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
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import SitterDashboard from "./pages/sitter/SitterDashboard";
import Booking from "./pages/owner/Booking";
// import Messages from "./pages/Messages";
import Profile from "./pages/owner/Profile"; // Owner Profile

const AppContent = () => {
  const { pathname } = useLocation();

  // -----------------------------
  // Toggle this flag to bypass login for development
  const isDevBypass = false; // const isDev = true;
  const isAuthenticated = !!localStorage.getItem("token"); // CHANGED from "access" to "token"
  // -----------------------------

  // Any path that should show the logged-in navbar
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

  // (older version)line 31-41 Dashboard/protected routes
  //const dashboardRoutes = ["/dashboard", "/booking", "/messages", "/profile"];
  //const showDashboardNav = dashboardRoutes.includes(pathname);

  // Pages where **no navbar** should appear
  const hideNavbar = ["/login", "/create-account"].includes(pathname);

  // Helper for protected routes
  const Protected = (element) =>
    isDevBypass || isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <>
      {/* Render Navbar conditionally */}
      {!hideNavbar && (showDashboardNav ? <LoginNavbar /> : <Navbar />)}

      {/* Routes */}
      <Routes>
        {/* Public landing: if logged in, push to dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
          }
        />

        {/* Auth pages NO navbar */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={Protected(<OwnerDashboard />)} />
        <Route path="/owner/dashboard" element={Protected(<OwnerDashboard />)} />
        <Route path="/sitter/dashboard" element={Protected(<SitterDashboard />)} />
        <Route path="/booking" element={Protected(<Booking />)} />
        {/* <Route path="/messages" element={Protected(<Messages />)} /> */}

        {/* ✅ Added back profile route */}
        <Route path="/profile" element={Protected(<Profile />)} />

        {/* Fallback 404 */}
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
