import React, { useEffect, useState } from "react";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import HeroSection from "../../components/HeroSection";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ResponsiveMenu open={open} />

      {/* Dashboard-specific HeroSection */}
      <HeroSection
        title="Welcome Back, Paw Parent!"
        subtitle="Manage your bookings, messages, and sitter requests all in one place."
        buttonText="Get Started"
        onButtonClick={() => navigate("/booking")}
      />
    </>
  );
};

export default Dashboard;
