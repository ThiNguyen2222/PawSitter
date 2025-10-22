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
import Dashboard from "./pages/owner/OwnerDashboard";
import Booking from "./pages/owner/OwnerBooking";
// import Messages from "./pages/Messages";
// import Profile from "./pages/owner/OwnerProfile";

const AppContent = () => {
  const { pathname } = useLocation();

  // -----------------------------
  // Toggle this flag to bypass login for development
  const isDev = true;
  const isAuthenticated = !!localStorage.getItem("authToken");
  // -----------------------------

  // Dashboard/protected routes
  const dashboardRoutes = ["/dashboard", "/booking", "/messages", "/profile"];
  const showDashboardNav = dashboardRoutes.includes(pathname);

  // Pages where **no navbar** should appear
  const hideNavbar = ["/login", "/create-account"].includes(pathname);

  // Helper for protected routes
  const Protected = (element) =>
    isDev || isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <>
      {/* Render Navbar conditionally */}
      {!hideNavbar && (showDashboardNav ? <LoginNavbar /> : <Navbar />)}

      {/* Routes */}
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Home />} />

        {/* Auth pages without navbar */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={Protected(<Dashboard />)} />
        <Route path="/booking" element={Protected(<Booking />)} />
        {/* <Route path="/messages" element={Protected(<Messages />)} />
        <Route path="/profile" element={Protected(<Profile />)} /> */}
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
