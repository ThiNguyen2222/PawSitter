import React, { useState, useEffect } from "react";
import { Calendar, X, Check, Edit2, DollarSign, User } from "lucide-react";
import { getBookings, confirmBooking, cancelBooking, completeBooking } from "../../api/api";

// helper 
const getOwnerNameFromBooking = (booking) => {
  const owner = booking?.owner;
  if (!owner) return "Unknown Owner";

  // support both { owner: { user: {...} } } and { owner: {...} }
  const u = owner.user || owner;

  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return fullName || u.username || "Unknown Owner";
};

/* BOOKING ROW  */
const BookingRow = ({ booking, showActions = false, setSelectedBooking, handleUpdateStatus }) => {
  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const serviceMap = {
    house_sitting: "House Sitting",
    pet_boarding: "Pet Boarding",
    in_home_visit: "In-Home Visit",
    pet_grooming: "Pet Grooming",
    pet_walking: "Pet Walking",
  };

  // const getOwnerName = () => {
  //   const u = booking.owner?.user;
  //   return `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.username || "Unknown Owner";
  // };

  const getPetInfo = () => {
    if (!booking.pet_details?.length) return "No pets specified";
    return booking.pet_details.map((p) => p.species || "pet").join("/");
  };

  return (
    <div className="flex items-center py-5 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Date */}
      <div className="w-48 flex-shrink-0 text-primary font-medium">
        {formatDateRange(booking.start_ts, booking.end_ts)}
      </div>

      {/* Owner */}
      <div className="flex-1 min-w-0 px-4">
        <div className="text-primary font-medium truncate">{getOwnerNameFromBooking(booking)}</div>
        <div className="text-gray-500 text-sm">{serviceMap[booking.service_type]}</div>
      </div>

      {/* Pets */}
      <div className="w-48 px-4 text-primary font-medium">{getPetInfo()}</div>

      {/* Price */}
      <div className="w-40 text-right">
        <div className="text-primary font-semibold text-lg">${booking.price_quote}</div>
        <div className="text-gray-500 text-sm">Booking value</div>
      </div>

      {/* Buttons */}
      <div className="w-56 flex justify-end gap-2">
        {showActions && booking.status === "requested" && (
          <button
            onClick={() => handleUpdateStatus(booking.id, "confirmed")}
            className="px-5 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90"
          >
            <Check className="w-4 h-4 inline mr-1" /> Approve
          </button>
        )}

        {!showActions && booking.status === "confirmed" && (
          <button
            onClick={() => handleUpdateStatus(booking.id, "completed")}
            className="px-5 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90"
          >
            <Check className="w-4 h-4 inline mr-1" /> Complete
          </button>
        )}

        <button
          onClick={() => setSelectedBooking(booking)}
          className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {booking.status !== "completed" && (
          <button
            onClick={() => handleUpdateStatus(booking.id, "canceled")}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* BOOKING CARD */
const BookingCard = ({ booking, setSelectedBooking }) => {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // const getOwnerName = () => {
  //   const u = booking.owner?.user;
  //   return `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.username;
  // };

  return (
    <div
      onClick={() => setSelectedBooking(booking)}
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition cursor-pointer mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-primary font-semibold text-lg mb-1">{getOwnerNameFromBooking(booking)}</div>

          <div className="text-sm text-gray-600 mb-1">
            {formatDate(booking.start_ts)} → {formatDate(booking.end_ts)}
          </div>

          <div className="text-sm text-gray-500 mb-2">
            {formatTime(booking.start_ts)} - {formatTime(booking.end_ts)}
          </div>

          {booking.pet_details?.length > 0 && (
            <div className="text-sm text-gray-600">
              {booking.pet_details.length}{" "}
              {booking.pet_details.length === 1 ? "Pet" : "Pets"}:{" "}
              {booking.pet_details.map((p) => p.name).join(", ")}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-xl font-semibold text-primary mb-2">${booking.price_quote}</div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Completed
          </span>
        </div>
      </div>
    </div>
  );
};

/* BOOKING DETAILS MODAL */
const ScheduleDetails = ({ booking, onClose, error, handleUpdateStatus }) => {
  if (!booking) return null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  // const getOwnerName = () => {
  //   const u = booking.owner?.user;
  //   return `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || u?.username;
  // };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-y-auto max-h-[90vh]">
        <div className="p-5 border-b flex justify-between">
          <h3 className="text-xl font-bold text-primary">Booking Details</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
              {error}
            </div>
          )}

          {/* Owner */}
          <div>
            <div className="text-sm text-gray-500">Owner</div>
            <div className="text-primary font-semibold text-lg">{getOwnerNameFromBooking(booking)}</div>
          </div>

          {/* Dates */}
          <div>
            <div className="text-sm text-gray-500">Check-in</div>
            <div>
              {formatDate(booking.start_ts)} at {formatTime(booking.start_ts)}
            </div>

            <div className="text-sm text-gray-500 mt-4">Check-out</div>
            <div>
              {formatDate(booking.end_ts)} at {formatTime(booking.end_ts)}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="text-sm text-gray-500">Payment</div>
            <div className="text-primary font-bold text-2xl">
              ${booking.price_quote}
            </div>
          </div>

          {/* Buttons */}
          {booking.status === "requested" && (
            <button
              onClick={() => handleUpdateStatus(booking.id, "confirmed")}
              className="w-full bg-secondary text-white py-3 rounded-lg mt-4"
            >
              Accept Booking
            </button>
          )}

          {booking.status === "confirmed" && (
            <button
              onClick={() => handleUpdateStatus(booking.id, "completed")}
              className="w-full bg-secondary text-white py-3 rounded-lg mt-4"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* MAIN PAGE */
const Schedule = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [bookings, setBookings] = useState({ upcoming: [], active: [], completed: [] });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const all = await getBookings();
      const now = new Date();

      setBookings({
        upcoming: all.filter((b) => b.status === "requested" && new Date(b.start_ts) >= now),
        active: all.filter((b) => b.status === "confirmed" && new Date(b.end_ts) >= now),
        completed: all.filter((b) => b.status === "completed"),
      });
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      if (status === "confirmed") await confirmBooking(id);
      if (status === "canceled") await cancelBooking(id);
      if (status === "completed") await completeBooking(id);

      loadBookings();
      setSelectedBooking(null);
    } catch {
      setError("Failed to update booking.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0e6e4] to-white pt-24 pb-12">
      <div className="w-[80%] mx-auto">
        {/* MODAL */}
        {selectedBooking && (
          <ScheduleDetails
            booking={selectedBooking}
            error={error}
            handleUpdateStatus={handleUpdateStatus}
            onClose={() => setSelectedBooking(null)}
          />
        )}

        {/* TABS */}
        <div className="flex gap-8 border-b border-gray-300 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 font-medium ${
              activeTab === "active" ? "text-primary border-b-2 border-primary" : "text-gray-600"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 font-medium ${
              activeTab === "completed"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600"
            }`}
          >
            Completed
          </button>
        </div>

        {/* ACTIVE TAB */}
        {activeTab === "active" && (
          <>
            {/* UPCOMING */}
            {bookings.upcoming.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-4">Approve Booking</h2>
                <div className="bg-white rounded-lg shadow-sm">
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

            {/* ACTIVE */}
            <h2 className="text-2xl font-bold text-primary mb-4">Active Schedule</h2>
            {bookings.active.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No active bookings</p>
                <p className="text-sm">Your upcoming and active bookings will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
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
          </>
        )}

        {/* COMPLETED TAB */}
        {activeTab === "completed" && (
          <div>
            {bookings.completed.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No completed bookings</p>
                <p className="text-sm">Your booking history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.completed
                  .sort((a, b) => new Date(b.end_ts) - new Date(a.end_ts))
                  .map((b) => (
                    <BookingCard key={b.id} booking={b} setSelectedBooking={setSelectedBooking} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { BookingRow, BookingCard, ScheduleDetails };
export default Schedule;
