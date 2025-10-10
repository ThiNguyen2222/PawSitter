import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PetSection from './components/PetSection';
import About from './components/About';
import Services from './components/Services';
import Testimony from './components/Testimony';
import BackendData from './components/BackendData';
import LoginForm from './pages/LoginForm';
import CreateAccount from './pages/CreateAccount';

// ✅ Separate component so we can use useLocation
const AppContent = () => {
  const location = useLocation();

  // ✅ hide Navbar on these pages
  const hideNavbar = ['/login', '/create-account'].includes(location.pathname);

  return (
    <div className="overflow-x-hidden">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <>
              <BackendData />
              <HeroSection />
              <PetSection />
              <About />
              <Services />
              <Testimony />
            </>
          }
        />

        {/* Login Page */}
        <Route path="/login" element={<LoginForm />} />

        {/* Create Account Page */}
        <Route path="/create-account" element={<CreateAccount />} />
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
