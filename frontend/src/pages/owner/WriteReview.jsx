// owner/booking/WriteReview.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ResponsiveMenu from "../../components/ResponsiveMenu";
import API, { getBookings } from "../../api/api";
import { FaStar } from "react-icons/fa";

const StarRatingInput = ({ value, onChange }) => {
  const handleClick = (ratingValue) => {
    onChange(ratingValue);
  };
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => handleClick(num)}
          className="focus:outline-none"
        >
          <FaStar
            size={28}
            className={
              num <= value
                ? "text-orange-500"   // filled stars
                : "text-gray-300"     // empty stars
            }
          />
        </button>
      ))}

      {/* Optional text label */}
      <span className="ml-2 text-gray-700">
        {value === 5 && "Excellent"}
        {value === 4 && "Good"}
        {value === 3 && "Average"}
        {value === 2 && "Poor"}
        {value === 1 && "Terrible"}
      </span>
    </div>
  );
};

const WriteReview = () => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sitterId = searchParams.get("sitter"); // from ?sitter=...
  const [selectedSitterId, setSelectedSitterId] = useState(sitterId || "");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // close mobile menu on resize.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // load owner bookings and filter to completed ones with this sitter
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getBookings(); // assuming this returns owner's bookings

        let list = Array.isArray(data) ? data : data.results || [];

        if (sitterId) {
          list = list.filter(
            (b) =>
              String(b.sitter_id) === String(sitterId) && b.status === "completed"
          );
        } else {
          // if no sitter given, still only show completed bookings
          list = list.filter((b) => b.status === "completed");
        }

        setBookings(list);

        // if exactly one booking, pre-select it
        if (list.length === 1) {
            const only = list[0];
            const onlySitterId = String(only.sitter?.id || only.sitter_id);
            setSelectedSitterId(onlySitterId);
            setSelectedBookingId(only.id);
        } else if (sitterId) {
            // if sitterId was passed in query, preselect that sitter
            setSelectedSitterId(sitterId);
            }
      } catch (err) {
        console.error("Error loading bookings for review:", err);
        setError("Failed to load your completed bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [sitterId]);

  useEffect(() => {
  if (!selectedSitterId) {
    setSelectedBookingId("");
    return;
  }

  const candidates = bookings.filter(
    (b) =>
      String(b.sitter_id) === String(selectedSitterId) &&
      b.status === "completed"
  );

  // pick the first matching completed booking
  if (candidates.length > 0) {
    setSelectedBookingId(candidates[0].id);
  } else {
    setSelectedBookingId("");
  }
}, [selectedSitterId, bookings]);

const sitterOptions = React.useMemo(() => {
  const map = new Map();

  bookings.forEach((b) => {
    const id = b.sitter_id;
    if (!id) return;

    const name = b.sitter_name || `Sitter #${id}`;

    if (!map.has(id)) {
      map.set(id, { id: String(id), name });
    }
  });

  return Array.from(map.values());
}, [bookings]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedBookingId) {
      setError("Please select a booking to review.");
      return;
    }

    try {
      await API.post("/reviews/", {
        booking: selectedBookingId,
        rating: Number(rating),
        comment,
      });

      setSuccess("Thank you! Your review has been submitted.");
      // optional: go back to sitter's profile after a short delay
      // if (sitterId) navigate(`/sitter/${sitterId}`);
    } catch (err) {
      console.error("Error submitting review:", err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not submit review. Make sure the booking is completed and not already reviewed.";
      setError(msg);
    }
  };

  if (loading) {
    return (
      <>
        <ResponsiveMenu open={open} />
        <div className="pt-24 text-center text-gray-600">Loading…</div>
      </>
    );
  }
  
  return (
    <>
      <ResponsiveMenu open={open} />

      <div className="pt-24 max-w-4xl mx-auto px-4 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary mb-4 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-primary mb-2">
          Write a Review
        </h1>

        {bookings.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
            You don’t have any completed bookings {sitterId && "with this sitter"} to review yet.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4">
            {success}
          </div>
        )}

        {bookings.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm p-6">
            {/* Booking selector */}
            <div>
                <label className="block text-base font-bold text-gray-700 mb-1">
                    Write the review for:
                </label>
                <select
                    value={selectedSitterId}
                    onChange={(e) => setSelectedSitterId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Select a sitter</option>
                    {sitterOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                    ))}
                </select>
                </div>

            {/* Rating */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-1">
                Rating
              </label>

              <StarRatingInput value={rating} onChange={setRating} />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-1">
                Tell us about your experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Share your experience with this sitter…"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-secondary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-secondary/80 transition"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default WriteReview;
