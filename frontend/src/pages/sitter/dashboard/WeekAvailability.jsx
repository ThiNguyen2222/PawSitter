import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import API from "../../../api/api";

const MyAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("20:00");
  const [selectedStatus, setSelectedStatus] = useState("open");

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load existing availability
  const fetchMySlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("availability/", { params: { mine: "true" } });
      setSlots(res.data);
    } catch (e) {
      console.error("Failed to load availability:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySlots();
  }, []);

  const getWeekDates = () => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      arr.push(d);
    }
    return arr;
  };

  const previousWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const getDateStatus = (date) => {
    const dateStr = date.toDateString();
    const daySlots = slots.filter(
      (s) => new Date(s.start_ts).toDateString() === dateStr
    );

    if (daySlots.length === 0) return null;
    if (daySlots.some((s) => s.status === "booked")) return "booked";
    if (daySlots.some((s) => s.status === "blocked")) return "blocked";
    return "open";
  };

  const isToday = (d) =>
    d.toDateString() === new Date().toDateString();

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
    setShowEditModal(false);

    const existing = slots.find(
      (s) => new Date(s.start_ts).toDateString() === date.toDateString()
    );

    if (existing) {
      setSelectedStatus(existing.status === "booked" ? "open" : existing.status);
      const start = new Date(existing.start_ts);
      const end = new Date(existing.end_ts);
      setTimeFrom(start.toTimeString().slice(0, 5));
      setTimeTo(end.toTimeString().slice(0, 5));
    } else {
      setSelectedStatus("open");
      setTimeFrom("08:00");
      setTimeTo("20:00");
    }
  };

  const handleSetAvailability = async () => {
    if (!selectedDate) return;

    const [sh, sm] = timeFrom.split(":").map(Number);
    const [eh, em] = timeTo.split(":").map(Number);

    const start = new Date(selectedDate);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(eh, em, 0, 0);

    if (start >= end) {
      alert("End time must be after start time.");
      return;
    }

    try {
      const existing = slots.find(
        (s) => new Date(s.start_ts).toDateString() === selectedDate.toDateString()
      );

      if (existing) {
        await API.patch(`availability/${existing.id}/`, {
          status: selectedStatus,
          start_ts: start.toISOString(),
          end_ts: end.toISOString(),
        });
      } else {
        await API.post("availability/", {
          status: selectedStatus,
          start_ts: start.toISOString(),
          end_ts: end.toISOString(),
        });
      }

      fetchMySlots();
      setShowModal(false);
      setShowEditModal(false);
      setSelectedDate(null);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.non_field_errors?.[0] || "Could not update availability.");
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedDate) return;

    const existing = slots.find(
      (s) => new Date(s.start_ts).toDateString() === selectedDate.toDateString()
    );

    if (!existing) {
      setShowModal(false);
      setShowEditModal(false);
      setSelectedDate(null);
      return;
    }

    try {
      await API.delete(`availability/${existing.id}/`);
      fetchMySlots();
      setShowModal(false);
      setShowEditModal(false);
      setSelectedDate(null);
    } catch (e) {
      console.error(e);
      alert("Could not delete availability.");
    }
  };

  const formatWeekRange = () => {
    const arr = getWeekDates();
    const s = arr[0];
    const e = arr[6];

    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString("en-US", { month: "long" })} ${s.getDate()}-${e.getDate()}, ${s.getFullYear()}`;
    }

    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    )}, ${e.getFullYear()}`;
  };

  if (loading) {
    return (
      <section className="container flex justify-between items-center py-8 pt-32">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Your Availability
          </h2>
          <p className="text-gray-600">Loading availability…</p>
        </div>
      </section>
    );
  }

  const weekDates = getWeekDates();

  return (
    <>
      {/* MAIN CONTAINER — aligned with navbar */}
      <div className="w-[80%] mx-auto mt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Your Availability
          </h2>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={previousWeek} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h3 className="text-lg font-semibold text-primary">
            {formatWeekRange()}
          </h3>

          <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-7 gap-3">
            {weekDates.map((date, i) => {
              const status = getDateStatus(date);
              const today = isToday(date);

              let bg = "bg-white hover:bg-gray-50";
              let border = "border-gray-200";
              let text = "text-gray-800";
              let indicator = null;

              if (status === "open") {
                bg = "bg-green-50 hover:bg-green-100";
                border = "border-green-300";
                indicator = <Check className="w-4 h-4 text-green-600 mt-2" />;
              } else if (status === "blocked") {
                bg = "bg-orange-50 hover:bg-orange-100";
                border = "border-orange-300";
                indicator = <X className="w-4 h-4 text-orange-600 mt-2" />;
              } else if (status === "booked") {
                bg = "bg-red-50 hover:bg-red-100";
                border = "border-red-300";
                text = "text-red-700";
                indicator = (
                  <span className="text-xs text-red-600 mt-2 font-medium">
                    Booked
                  </span>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(date)}
                  className={`relative p-4 rounded-lg border-2 ${bg} ${border} transition flex flex-col items-center justify-center min-h-[120px]`}
                >
                  {today && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  <div className="text-xs text-gray-500 mb-1">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>

                  <div className={`text-2xl font-semibold ${text}`}>
                    {date.getDate()}
                  </div>

                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </div>

                  {indicator}
                </button>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="flex justify-center gap-4 text-sm mt-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-50 border-2 border-green-300 rounded flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              Available
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-50 border-2 border-orange-300 rounded flex items-center justify-center">
                <X className="w-3 h-3 text-orange-600" />
              </div>
              Blocked
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-50 border-2 border-red-300 rounded" />
              Booked
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            Click on any date to set your availability
          </p>
        </div>
      </div>
      </div>

      {/* ALL MODALS BELOW */}
      {/* VIEW MODAL */}
      {showModal && selectedDate && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Availability Details</h3>
              <button
                onClick={() => { setShowModal(false); setSelectedDate(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const slot = slots.find(
                (s) => new Date(s.start_ts).toDateString() === selectedDate.toDateString()
              );

              if (!slot) {
                return (
                  <div className="mb-6 p-4 bg-gray-50 border rounded">
                    No availability set for this day.
                  </div>
                );
              }

              const start = new Date(slot.start_ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              const end = new Date(slot.end_ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

              const style =
                slot.status === "open"
                  ? "bg-green-100 text-green-700"
                  : slot.status === "blocked"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700";

              const label =
                slot.status === "open"
                  ? "Available"
                  : slot.status === "blocked"
                  ? "Blocked"
                  : "Booked";

              return (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <div className={`inline-block px-4 py-2 rounded-lg ${style} font-medium`}>
                      {label}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Time Range</label>
                    <div className="text-gray-900">{start} – {end}</div>
                  </div>

                  {slot.status === "booked" && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                      ⚠️ This day is booked.
                    </div>
                  )}
                </>
              );
            })()}

            <button
              onClick={() => setShowEditModal(true)}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90"
            >
              Edit Availability
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Edit Availability</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Day</label>
              <div className="bg-gray-50 border rounded-lg px-4 py-2 font-medium">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">Set Availability</label>
              <div className="bg-gray-100 rounded-full p-1 grid grid-cols-2 gap-1">
                <button
                  onClick={() => setSelectedStatus("blocked")}
                  className={`py-2 rounded-full font-medium ${
                    selectedStatus === "blocked"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  Block
                </button>
                <button
                  onClick={() => setSelectedStatus("open")}
                  className={`py-2 rounded-full font-medium ${
                    selectedStatus === "open"
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  Open
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeleteAvailability}
                className="py-3 bg-white border rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handleSetAvailability}
                className="py-3 bg-primary text-white rounded-lg hover:bg-opacity-90"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default MyAvailability;