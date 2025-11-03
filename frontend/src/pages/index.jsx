import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import Services from "../components/Services";
import About from "../components/About";
// import Contact if you have one

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    // When a hash (#services, #about, etc.) is present, scroll to that section
    if (location.hash) {
      const id = decodeURIComponent(location.hash.replace("#", ""));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <HeroSection />
      <Services />
      <About />
      {/* <Contact /> */}
    </>
  );
};

export default LandingPage;