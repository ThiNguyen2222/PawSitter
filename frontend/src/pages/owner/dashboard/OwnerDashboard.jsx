import React, { useEffect, useState } from "react";
import HeroSection from "../../../components/LoginHero";
import ContactUs from "../../../components/ContactUs";
import ResponsiveMenu from "../../../components/ResponsiveMenu";
import { useNavigate } from "react-router-dom";
import PetsSection from "./MyPets";
import SittersSection from "./TrustedSitters";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu on resize
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

      <div className="pt-24">
        <HeroSection
          title="Welcome Back, Paw Parent!"
          subtitle="Manage your bookings, messages, and sitter requests all in one place."
          buttonText="Get Started"
          onButtonClick={() => navigate("/owner/booking")}
        />
      </div>
      <PetsSection />
      <SittersSection />
      <ContactUs />
    </>
  );
};

export default Dashboard;