import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import API from "../../../api/api";

const MyAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("20:00");

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

  // Calendar helpers
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const formatMonthYear = (date) =>
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const getDateStatus = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toDateString();

    const daySlots = slots.filter(
      (slot) =>
        new Date(slot.start_ts).toDateString() === dateStr
    );

    if (daySlots.length === 0) return null;
    if (daySlots.some((s) => s.status === "booked")) return "booked";
    if (daySlots.some((s) => s.status === "blocked")) return "blocked";
    return "open";
  };

  const handleDateClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  };

  const handleSetAvailability = async (status) => {
    if (!selectedDate) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const existingSlot = slots.find(
        (slot) =>
          new Date(slot.start_ts).toDateString() ===
          selectedDate.toDateString()
      );

      if (existingSlot) {
        await API.patch(`availability/${existingSlot.id}/`, { status });
      } else {
        await API.post("availability/", {
          start_ts: startOfDay.toISOString(),
          end_ts: endOfDay.toISOString(),
          status,
        });
      }

      fetchMySlots();
      setSelectedDate(null);
    } catch (e) {
      console.error(e);
      alert("Could not update availability.");
    }
  };

  const handleDeleteAvailability = async () => {
    if (!selectedDate) return;

    const existingSlot = slots.find(
      (slot) =>
        new Date(slot.start_ts).toDateString() ===
        selectedDate.toDateString()
    );

    if (!existingSlot) return setSelectedDate(null);

    try {
      await API.delete(`availability/${existingSlot.id}/`);
      fetchMySlots();
      setSelectedDate(null);
    } catch (e) {
      console.error(e);
      alert("Could not delete availability.");
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        -firstDay + i + 1
      ).getDate();

      days.push(
        <div
          key={`empty-${i}`}
          className="aspect-square p-3 text-gray-300 text-center font-medium"
        >
          {prevDay}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatus(day);
      const isSelected =
        selectedDate &&
        selectedDate.toDateString() ===
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          ).toDateString();

      let bgColor = "bg-white hover:bg-gray-50";
      let borderColor = "border-gray-200";
      let textColor = "text-gray-800";
      let statusLabel = null;

      if (status === "open") {
        bgColor = "bg-green-50 hover:bg-green-100";
        borderColor = "border-green-300";
        statusLabel = (
          <div className="flex items-center justify-center mt-1">
            <Check className="w-3 h-3 text-green-700" />
          </div>
        );
      } else if (status === "blocked") {
        bgColor = "bg-orange-50 hover:bg-orange-100";
        borderColor = "border-orange-300";
        statusLabel = (
          <div className="flex items-center justify-center mt-1">
            <X className="w-3 h-3 text-orange-600" />
          </div>
        );
      } else if (status === "booked") {
        bgColor = "bg-red-50 hover:bg-red-100";
        borderColor = "border-red-300";
        textColor = "text-red-700";
        statusLabel = (
          <span className="text-xs text-red-600 font-medium mt-1 block">
            Booked
          </span>
        );
      }

      if (isSelected) {
        borderColor =
          "border-primary ring-2 ring-primary ring-opacity-50";
      }

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`aspect-square p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} cursor-pointer transition-all flex flex-col items-center justify-center`}
        >
          <div className="font-semibold text-base">{day}</div>
          {statusLabel}
        </button>
      );
    }

    return days;
  };

  // ------------------------
  // LOADING STATE
  // ------------------------
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-b from-[#f0e6e4] to-white -z-10" />

        {/* 🔥 FIXED: align with navbar */}
        <section className="py-10 pt-20 px-6 lg:px-12">
          <div className="w-full">
            <h2 className="text-3xl text-primary font-semibold mb-8">
              Your Availability
            </h2>
            <p>Loading availability...</p>
          </div>
        </section>
      </>
    );
  }

  // ------------------------
  // MAIN CONTENT
  // ------------------------
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#f0e6e4] to-white -z-10" />

      {/* 🔥 FIXED: align with navbar */}
      <section className="py-10 pt-20 px-6 lg:px-12">
        <div className="w-full">

          <h2 className="text-3xl text-primary font-semibold mb-8">
            Your Availability
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Calendar Section */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h3 className="text-2xl font-semibold text-gray-800">
                  {formatMonthYear(currentDate)}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-center font-semibold text-gray-600 py-2 text-sm"
                  >
                    {d}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {selectedDate ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-xl mb-6 text-gray-800">
                    Set availability
                  </h3>

                  {/* Day Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 font-medium">
                      {selectedDate
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                        .replace(/\//g, ".")}
                    </div>
                  </div>

                  {/* Time Inputs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time-From
                      </label>
                      <input
                        type="time"
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time-To
                      </label>
                      <input
                        type="time"
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                      />
                    </div>
                  </div>

                  {/* Open / Block */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Set availability
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSetAvailability("blocked")}
                        className="py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50"
                      >
                        Block
                      </button>

                      <button
                        onClick={() => handleSetAvailability("open")}
                        className="py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50"
                      >
                        Open
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDeleteAvailability}
                      className="py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>

                    <button
                      onClick={() => setSelectedDate(null)}
                      className="py-3 px-4 bg-secondary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">
                    Legend
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 border-2 border-green-300 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-gray-700">Available</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-center justify-center">
                        <X className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-gray-700">Blocked</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 border-2 border-red-300 rounded-lg"></div>
                      <span className="text-gray-700">Booked</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Click on any date to set your availability.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default MyAvailability;
