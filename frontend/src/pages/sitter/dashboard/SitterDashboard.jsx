import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../../components/ResponsiveMenu";
import HeroSection from "../../../components/HeroSection";

// ⬇️ Create these three files as simple sections (stubs shown below)
import AvailabilitySection from "./MyAvailability";
import JobsSection from "./UpcomingJobs";
import ReviewsSection from "./MyReviews";

const SitterDashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu on resize (same pattern as OwnerDashboard)
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

      <HeroSection
        title="Welcome Back, Trusted Sitter!"
        subtitle="Manage your availability, job requests, and messages in one place."
        buttonText="Manage Availability"
        onButtonClick={() => navigate("/sitter/availability")}
      />

      <AvailabilitySection />
      <JobsSection />
      <ReviewsSection />
    </>
  );
};

export default SitterDashboard;