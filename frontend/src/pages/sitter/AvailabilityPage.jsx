import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import API from "../../api/api";

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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Check if a date has availability and get its status
  const getDateStatus = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toDateString();

    const daySlots = slots.filter((slot) => {
      const slotDate = new Date(slot.start_ts).toDateString();
      return slotDate === dateStr;
    });

    if (daySlots.length === 0) return null;
    
    // Priority: booked > blocked > open
    if (daySlots.some(s => s.status === "booked")) return "booked";
    if (daySlots.some(s => s.status === "blocked")) return "blocked";
    return "open";
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const handleSetAvailability = async (status) => {
    if (!selectedDate) return;

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Check if slot already exists for this date
      const existingSlot = slots.find((slot) => {
        const slotDate = new Date(slot.start_ts).toDateString();
        return slotDate === selectedDate.toDateString();
      });

      if (existingSlot) {
        // Update existing slot
        await API.patch(`availability/${existingSlot.id}/`, { status });
      } else {
        // Create new slot
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

    const existingSlot = slots.find((slot) => {
      const slotDate = new Date(slot.start_ts).toDateString();
      return slotDate === selectedDate.toDateString();
    });

    if (!existingSlot) {
      setSelectedDate(null);
      return;
    }

    try {
      await API.delete(`availability/${existingSlot.id}/`);
      fetchMySlots();
      setSelectedDate(null);
    } catch (e) {
      console.error(e);
      alert("Could not delete availability.");
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's days
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), -firstDay + i + 1).getDate();
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-3 text-gray-300 text-center font-medium">
          {prevMonthDay}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatus(day);
      const isSelected = selectedDate && 
        selectedDate.toDateString() === 
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      let bgColor = "bg-white hover:bg-gray-50";
      let borderColor = "border-gray-200";
      let textColor = "text-gray-800";
      let statusLabel = null;

      if (status === "open") {
        bgColor = "bg-green-50 hover:bg-green-100";
        borderColor = "border-green-300";
        statusLabel = (
          <div className="flex items-center justify-center mt-1">
            <Check className="w-3 h-3 text-green-600" />
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
          <span className="text-xs text-red-600 font-medium mt-1 block">Booked</span>
        );
      }

      if (isSelected) {
        borderColor = "border-primary ring-2 ring-primary ring-opacity-50";
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

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-b from-[#f0e6e4] to-white -z-10" />
        <section className="container flex justify-between items-center py-8 pt-32">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl text-primary font-semibold mb-8">
              Your Availability
            </h2>
            <p>Loading availability...</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#f0e6e4] to-white -z-10" />
      <section className="container flex justify-between items-center py-8 pt-32">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl text-primary font-semibold mb-8">
            Your Availability
          </h2>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            {/* Calendar Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h3 className="text-2xl font-semibold text-gray-800">
                  {formatMonthYear(currentDate)}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3">
                {/* Day headers */}
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div key={i} className="text-center font-semibold text-gray-600 py-2 text-sm">
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {renderCalendar()}
              </div>
            </div>

            {/* Right Panel - Set Availability */}
            <div className="space-y-6">
              {selectedDate ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-xl mb-6 text-gray-800">Set availability</h3>
                  
                  {/* Day Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 font-medium">
                      {selectedDate.toLocaleDateString("en-GB", { 
                        day: "2-digit", 
                        month: "2-digit", 
                        year: "numeric" 
                      }).replace(/\//g, '.')}
                    </div>
                  </div>

                  {/* Time From and Time To */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time-From</label>
                      <input
                        type="time"
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time-To</label>
                      <input
                        type="time"
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Status Selection - Toggle Style */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Set availability</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSetAvailability("blocked")}
                        className="py-3 px-4 bg-white border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg font-medium transition-all"
                      >
                        Block
                      </button>
                      
                      <button
                        onClick={() => handleSetAvailability("open")}
                        className="py-3 px-4 bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded-lg font-medium transition-all"
                      >
                        Open
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDeleteAvailability}
                      className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Clear
                    </button>
                    
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="py-3 px-4 bg-secondary hover:bg-opacity-90 text-white rounded-lg font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-4 text-gray-800">Legend</h3>
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
                      Click on any date to set your availability for that day.
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