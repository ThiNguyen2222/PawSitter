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
import OwnerBooking from "./pages/owner/booking/Booking";
import OwnerProfile from "./pages/owner/Profile";
import EditProfile from "./pages/owner/EditProfile";
import FindSitters from "./pages/owner/FindSitters";

import SitterDashboard from "./pages/sitter/dashboard/SitterDashboard";
import SitterProfile from "./pages/sitter/Profile";
import AvailabilityPage from "./pages/sitter/AvailabilityPage";
import Schedule from "./pages/sitter/Schedule";
import EditProfileS from "./pages/sitter/EditProfileS"; 


import API from "./api/api";


const AppContent = () => {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    // Parse user to check their role
    let userData;
    try {
      userData = JSON.parse(user);
    } catch (e) {
      console.error("Error parsing user data:", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    // Validate token based on user role
    const endpoint = userData.role === "OWNER" 
      ? "profiles/owners/me/" 
      : "profiles/sitters/me/";

    API.get(endpoint)
      .then(() => setIsAuthenticated(true))
      .catch((error) => {
        console.error("Auth check failed:", error);
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
  const showDashboardNav =
    pathname.startsWith("/owner") || pathname.startsWith("/sitter");

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
              onLogin={() => setIsAuthenticated(true)}
            />
          }
        />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected Routes to owner/... */}
        <Route path="/owner/booking" element={Protected(<OwnerBooking />)} />
        <Route path="/owner/dashboard" element={Protected(<OwnerDashboard />)} />
        <Route path="/owner/profile" element={Protected(<OwnerProfile />)} />
        <Route path="/owner/edit-profile" element={Protected(<EditProfile />)} />
        <Route path="/owner/find-sitters" element={Protected(<FindSitters />)} />
        
        {/* Protected Routes to sitter/... */}
        <Route path="/sitter/dashboard" element={Protected(<SitterDashboard />)} />
        <Route path="/sitter/availability" element={Protected(<AvailabilityPage />)} />
        <Route path="/sitter/schedule" element={Protected(<Schedule />)} />
        <Route path="/sitter/profile" element={Protected(<SitterProfile />)} />
        <Route path="/sitter/edit-profile" element={Protected(<EditProfileS />)} />

        {/* Owner viewing a specific sitter */}
        <Route path="/sitter/:id" element={Protected(<SitterProfile />)} /> {/* later make a dedicated comp for public sitter */}
        
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