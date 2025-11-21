// src/pages/sitter/dashboard/SitterDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../../components/ResponsiveMenu";
import LoginHero from "../../../components/LoginHero";
import WeekAvailability from "./WeekAvailability";

import { getBookings, confirmBooking, cancelBooking, completeBooking } from "../../../api/api";
import { BookingRow, ScheduleDetails } from "../Schedule";

const SitterDashboard = () => {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState({ upcoming: [], active: [] });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FETCH UPCOMING + ACTIVE BOOKINGS
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const all = await getBookings();
      const now = new Date();

      const upcoming = all.filter(
        (b) => b.status === "requested" && new Date(b.start_ts) >= now
      );

      const active = all.filter(
        (b) => b.status === "confirmed" && new Date(b.end_ts) >= now
      );

      setBookings({ upcoming, active });
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    }
  };

  // UPDATE BOOKING STATUS (Approve / Complete / Cancel)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      if (newStatus === "confirmed") await confirmBooking(bookingId);
      if (newStatus === "canceled") await cancelBooking(bookingId);
      if (newStatus === "completed") await completeBooking(bookingId);

      await fetchData();        
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update booking.");
    }
  };

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

      {/* CONFIRM + ACTIVE SCHEDULE*/}
      <div className="w-[80%] mx-auto mt-10 space-y-10">

        {/* CONFIRM BOOKING */}
        {bookings.upcoming.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              Approve Booking
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {bookings.upcoming.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  showActions={true}
                  setSelectedBooking={setSelectedBooking}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE BOOKINGS */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4">
            Active Schedule
          </h2>

          {bookings.active.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No active bookings
            </p>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {bookings.active.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  showActions={false}
                  setSelectedBooking={setSelectedBooking}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* SEE ALL BOOKINGS BUTTON AT BOTTOM */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate("/sitter/schedule")}
            className="text-primary hover:text-primary/70 font-medium flex items-center gap-2 transition"
          >
            See all bookings →
          </button>
        </div>

      </div>


      {/* MODAL */}
      {selectedBooking && (
        <ScheduleDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          error={error}
          handleUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* FLOATING WEEK AVAILABILITY */}
      <WeekAvailability />
    </>
  );
};

export default SitterDashboard;
