import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [sitterId, setSitterId] = useState("");
  const [startTs, setStartTs] = useState("");
  const [endTs, setEndTs] = useState("");
  const [priceQuote, setPriceQuote] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Replace with your backend URL
  const BASE_URL = "http://localhost:8000/api/bookings/";

  // 🔹 Load current user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("access"); // assuming JWT auth
        const res = await axios.get(BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Could not load bookings.");
      }
    };
    fetchBookings();
  }, []);

  // 🔹 Create a new booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("access");
      const res = await axios.post(
        BASE_URL,
        {
          sitter: sitterId,
          start_ts: startTs,
          end_ts: endTs,
          price_quote: priceQuote,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings([...bookings, res.data]); // add new booking to list
      setSitterId("");
      setStartTs("");
      setEndTs("");
      setPriceQuote("");
    } catch (err) {
      console.error("Booking creation failed:", err);
      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors.join(" "));
      } else {
        setError("Failed to create booking.");
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-sky-700 mb-6">Book a Service</h1>

      {/* 🔹 Booking form */}
      <form
        onSubmit={handleCreateBooking}
        className="bg-white shadow-md rounded-lg p-6 mb-10 max-w-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Create New Booking
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Your Selected Sitter
          </label>
          <input
            type="number"
            value={sitterId}
            onChange={(e) => setSitterId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTs}
            onChange={(e) => setStartTs(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            value={endTs}
            onChange={(e) => setEndTs(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Price Quote
          </label>
          <input
            type="number"
            step="0.01"
            value={priceQuote}
            onChange={(e) => setPriceQuote(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <button
          type="submit"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
        >
          Create Booking
        </button>
      </form>

      {/* 🔹 Bookings list */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Existing Bookings
        </h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left py-2 px-3">Sitter</th>
                <th className="text-left py-2 px-3">Start</th>
                <th className="text-left py-2 px-3">End</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 px-3">{b.sitter_id}</td>
                  <td className="py-2 px-3">{new Date(b.start_ts).toLocaleString()}</td>
                  <td className="py-2 px-3">{new Date(b.end_ts).toLocaleString()}</td>
                  <td className="py-2 px-3 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Booking;
