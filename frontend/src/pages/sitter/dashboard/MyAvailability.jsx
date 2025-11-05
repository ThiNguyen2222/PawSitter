// frontend/src/pages/sitter/dashboard/MyAvailability.jsx
import React from "react";
import AvailabilitySection from "../dashboard/MyAvailability"; // reuse the section, can change

const AvailabilityPage = () => (
  <main className="min-h-screen">
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Manage Availability</h1>
      <AvailabilitySection />
    </section>
  </main>
);
export default AvailabilitySection;
