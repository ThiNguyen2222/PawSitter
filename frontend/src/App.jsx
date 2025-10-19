import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PetSection from './components/PetSection';
import About from './components/About';
import Services from './components/Services';
import Testimony from './components/Testimony';
import LoginForm from './pages/LoginForm';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const location = useLocation();

  const hideNavbar = ['/login', '/create-account'].includes(location.pathname);

  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <div className="overflow-x-hidden">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <PetSection />
              <About />
              <Services />
              <Testimony />
            </>
          }
        />

        <Route path="/login" element={<LoginForm />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Use this to test out dashboard */}
        <Route
          path="/dashboard"
          element={
            isDev || !!localStorage.getItem('accessToken') ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* Authenticated Account can go on Dashboard
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        /> 
        */}
      </Routes>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
