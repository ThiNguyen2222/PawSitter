// src/pages/sitter/dashboard/SitterDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../../components/ResponsiveMenu";
import LoginHero from "../../../components/LoginHero";
import WeekAvailability from "./WeekAvailability";

const SitterDashboard = () => {
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

      {/* HERO */}
      <div className="pt-24">
        <LoginHero
          title="Welcome Back, Trusted Sitter!"
          subtitle="Manage your availability, job requests, and messages in one place."
          buttonText="Manage Availability"
          onButtonClick={() => navigate("/sitter/availability")}
        />
      </div>

      {/* FLOATING CALENDAR */}
        <WeekAvailability />

    </>
  );
};

export default SitterDashboard;
