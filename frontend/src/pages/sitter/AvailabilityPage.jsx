import React from "react";
import MyAvailability from "./dashboard/MyAvailability";

export default function AvailabilityPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-primary mb-6">Manage Availability</h1>
        <MyAvailability />
      </section>
    </main>
  );
}
