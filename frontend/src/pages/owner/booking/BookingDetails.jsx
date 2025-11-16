// owner/booking/BookingDetails.jsx
import React, { useState, useEffect } from "react";
import { Star, Calendar, Clock, X, AlertCircle, Award, PawPrint } from "lucide-react";
import API from "../../../api/api";

const BookingDetails = ({ formData, handleInputChange, sitters }) => {
  const [schedulePopup, setSchedulePopup] = useState(null);
  const [availableSitters, setAvailableSitters] = useState(sitters);
  const [sitterSchedules, setSitterSchedules] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [filteringAvailability, setFilteringAvailability] = useState(false);
  const [selectedDaySlots, setSelectedDaySlots] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Filter sitters based on date availability
  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
      filterAvailableSitters();
    } else {
      setAvailableSitters(sitters);
    }
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime, sitters]);

  const filterAvailableSitters = async () => {
    setFilteringAvailability(true);
    
    const requestStart = new Date(`${formData.startDate}T${formData.startTime}`);
    const requestEnd = new Date(`${formData.endDate}T${formData.endTime}`);

    const filtered = [];
    
    for (const sitter of sitters) {
      const isAvailable = await checkSitterAvailability(
        sitter.id,
        requestStart,
        requestEnd
      );
      if (isAvailable) {
        filtered.push(sitter);
      }
    }
    
    setAvailableSitters(filtered);
    setFilteringAvailability(false);
  };

  const checkSitterAvailability = async (sitterId, requestStart, requestEnd) => {
    try {
      const response = await API.get("availability/", { params: { sitter: sitterId } });
      const availabilitySlots = response.data;
      
      if (!availabilitySlots || availabilitySlots.length === 0) {
        return false;
      }

      const requestStartTime = requestStart.getTime();
      const requestEndTime = requestEnd.getTime();

      const hasAvailability = availabilitySlots.some(slot => {
        if (slot.status !== 'open') {
          return false;
        }
        
        const slotStart = new Date(slot.start_ts);
        const slotEnd = new Date(slot.end_ts);
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotEnd.getTime();
        
        return slotStartTime <= requestStartTime && slotEndTime >= requestEndTime;
      });

      return hasAvailability;
    } catch (error) {
      console.error(`Error checking availability for sitter ${sitterId}:`, error);
      return false;
    }
  };

  const loadSitterSchedule = async (sitter) => {
    if (sitterSchedules[sitter.id]) {
      setSchedulePopup(sitter);
      return;
    }

    setLoadingSchedule(true);
    try {
      const response = await API.get("availability/", { params: { sitter: sitter.id } });
      const availability = response.data;
      setSitterSchedules(prev => ({
        ...prev,
        [sitter.id]: availability || []
      }));
      setSchedulePopup(sitter);
    } catch (error) {
      console.error(`Error loading schedule for sitter ${sitter.id}:`, error);
      setSitterSchedules(prev => ({
        ...prev,
        [sitter.id]: []
      }));
      setSchedulePopup(sitter);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getScheduleForWeek = (sitter) => {
    const availability = sitterSchedules[sitter.id] || [];
    const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const openSlotsOnDay = availability.filter(slot => {
        if (slot.status !== 'open') return false;
        
        const slotStart = new Date(slot.start_ts);
        const slotEnd = new Date(slot.end_ts);
        
        return (slotStart < nextDay && slotEnd > date);
      });
      
      let totalHours = 0;
      openSlotsOnDay.forEach(slot => {
        const slotStart = new Date(slot.start_ts);
        const slotEnd = new Date(slot.end_ts);
        const hours = (slotEnd - slotStart) / (1000 * 60 * 60);
        totalHours += hours;
      });
      
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        openSlots: openSlotsOnDay,
        totalHours: Math.round(totalHours * 10) / 10,
        isAvailable: openSlotsOnDay.length > 0,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const showDaySlots = (day) => {
    if (!day.isAvailable) return;
    setSelectedDaySlots(day);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotClick = (slot, day) => {
    setSelectedTimeSlot(slot);
  };

  const applySelectedTime = () => {
    if (!selectedTimeSlot) return;
    
    const startTime = new Date(selectedTimeSlot.start_ts);
    const endTime = new Date(selectedTimeSlot.end_ts);
    
    const startDate = startTime.toISOString().split('T')[0];
    const startTimeStr = startTime.toTimeString().slice(0, 5);
    const endDate = endTime.toISOString().split('T')[0];
    const endTimeStr = endTime.toTimeString().slice(0, 5);
    
    // Update form data with times AND keep the sitter selected
    handleInputChange("startDate", startDate);
    handleInputChange("startTime", startTimeStr);
    handleInputChange("endDate", endDate);
    handleInputChange("endTime", endTimeStr);
    
    // Keep the sitter selected (schedulePopup contains the sitter info)
    if (schedulePopup) {
      handleInputChange("sitterId", schedulePopup.id);
      handleInputChange("sitterName", schedulePopup.display_name);
    }
    
    // Close the modal
    setSchedulePopup(null);
    setSelectedDaySlots(null);
    setSelectedTimeSlot(null);
  };

  const getPetTypes = (sitter) => {
    if (!sitter.tags || sitter.tags.length === 0) return [];
    return sitter.tags.filter(tag => 
      ['dogs', 'cats', 'birds', 'reptiles', 'small_animals', 'fish'].includes(tag.toLowerCase())
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-2">
          Booking Details
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a sitter and fill in your booking info
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          When do you need service?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary"
            />
          </div>
        </div>
        {formData.startDate && formData.endDate && formData.startTime && formData.endTime && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span>
              Showing only sitters available from {formData.startDate} {formData.startTime} to {formData.endDate} {formData.endTime}
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-primary mb-3 flex items-center justify-between">
          <span>
            {formData.startDate && formData.endDate && formData.startTime && formData.endTime 
              ? 'Available Pet Sitters' 
              : 'All Pet Sitters'}
          </span>
          <span className="text-sm font-normal text-gray-600">
            {filteringAvailability ? (
              <span className="text-secondary">Checking availability...</span>
            ) : (
              `${availableSitters.length} ${availableSitters.length === 1 ? 'sitter' : 'sitters'}`
            )}
          </span>
        </h3>
        
        {filteringAvailability ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-gray-600">Checking sitter availability...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {availableSitters.map((sitter) => {
              const isSelected = parseInt(formData.sitterId) === sitter.id;
              const petTypes = getPetTypes(sitter);
              
              return (
                <div
                  key={sitter.id}
                  onClick={() => {
                    handleInputChange("sitterId", sitter.id);
                    handleInputChange("sitterName", sitter.display_name);
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all shadow-sm cursor-pointer ${
                    isSelected
                      ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
                      : "border-gray-200 hover:border-secondary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {sitter.display_name}
                    </h4>
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="ml-1 text-sm text-gray-700 font-medium">
                        {sitter.avg_rating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {sitter.bio || 'No bio provided'}
                  </p>

                  {petTypes.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <PawPrint size={14} className="text-primary" />
                      <div className="flex gap-1.5 flex-wrap">
                        {petTypes.map((pet, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium capitalize"
                          >
                            {pet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sitter.specialties && sitter.specialties.length > 0 && (
                    <div className="flex items-start gap-2 mb-3">
                      <Award size={14} className="text-secondary mt-0.5 flex-shrink-0" />
                      <div className="flex gap-1.5 flex-wrap">
                        {sitter.specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium"
                          >
                            {specialty.name || specialty}
                          </span>
                        ))}
                        {sitter.specialties.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{sitter.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-3 pt-2 border-t border-gray-200">
                    <p className="text-primary font-semibold text-lg">
                      ${sitter.rate_hourly}/hr
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        sitter.verification_status === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {sitter.verification_status || 'UNVERIFIED'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSitterSchedule(sitter);
                    }}
                    disabled={loadingSchedule}
                    className="w-full py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 border border-primary/20"
                  >
                    <Clock size={16} />
                    {loadingSchedule && !schedulePopup ? 'Loading...' : 'View Weekly Schedule'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {formData.sitterId && !filteringAvailability && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Selected: {sitters.find((s) => s.id === parseInt(formData.sitterId))?.display_name}
            </p>
          </div>
        )}

        {!filteringAvailability && availableSitters.length === 0 && formData.startDate && formData.endDate && formData.startTime && formData.endTime && (
          <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={48} />
            <p className="text-red-700 font-semibold text-lg">No sitters available</p>
            <p className="text-red-600 text-sm mt-2">
              No sitters have open availability for {formData.startDate} {formData.startTime} to {formData.endDate} {formData.endTime}
            </p>
            <p className="text-red-500 text-sm mt-1">Try selecting different dates or times</p>
          </div>
        )}

        {availableSitters.length === 0 && (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Calendar className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-gray-600 font-medium">Select all date and time fields</p>
            <p className="text-gray-500 text-sm mt-1">Complete the booking times above to see available sitters</p>
          </div>
        )}
      </div>

      {schedulePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[85vh] overflow-hidden flex flex-col max-w-6xl">
            <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={24} className="text-primary" />
                  {schedulePopup.display_name}'s Schedule
                </h3>
              </div>
              <button
                onClick={() => {
                  setSchedulePopup(null);
                  setSelectedDaySlots(null);
                  setSelectedTimeSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Daily Schedule
                </h4>
                {sitterSchedules[schedulePopup.id]?.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-gray-700 font-semibold text-lg">No availability set</p>
                    <p className="text-gray-500 text-sm mt-2">
                      This sitter hasn't added their schedule yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getScheduleForWeek(schedulePopup).map((day, idx) => (
                      <div
                        key={idx}
                        onClick={() => showDaySlots(day)}
                        className={`bg-white rounded-xl border border-gray-200 p-5 transition cursor-pointer hover:shadow-md ${
                          selectedDaySlots?.date.getTime() === day.date.getTime() 
                            ? 'ring-2 ring-primary shadow-md' 
                            : 'hover:border-gray-300'
                        } ${!day.isAvailable ? 'opacity-60 cursor-default' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-gray-400 text-xs font-medium mb-1">
                              {day.dayName.toUpperCase()}
                            </div>
                            <h5 className="text-gray-800 font-semibold text-base mb-2">
                              {day.isAvailable ? 'Available' : 'Not available'}
                            </h5>
                            {day.isAvailable && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                <span>{day.totalHours}h open</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-gray-400 text-sm">
                            {idx === 0 ? 'Today' : `${idx}d`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-96 border-l border-gray-200 flex flex-col bg-white">
                <div className="px-8 py-5 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Available times
                  </h4>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                  {selectedDaySlots ? (
                    <div className="space-y-3">
                      {selectedDaySlots.openSlots.map((slot, idx) => {
                        const startTime = new Date(slot.start_ts);
                        const endTime = new Date(slot.end_ts);
                        const duration = (endTime - startTime) / (1000 * 60 * 60);
                        const isSelected = selectedTimeSlot?.id === slot.id;
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => handleTimeSlotClick(slot, selectedDaySlots)}
                            className={`bg-white rounded-xl border p-5 transition cursor-pointer ${
                              isSelected 
                                ? 'border-primary ring-2 ring-primary shadow-md' 
                                : 'border-gray-200 hover:border-primary hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="text-gray-400 text-xs font-medium">
                                {selectedDaySlots.dayName.toUpperCase()}
                              </div>
                              <div className="text-right text-gray-400 text-sm">
                                {duration.toFixed(0)}h
                              </div>
                            </div>
                            <h5 className="text-gray-800 font-semibold text-base mb-2">
                              {formatTime(startTime)} - {formatTime(endTime)}
                            </h5>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-green-500'}`}></span>
                              <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-green-600'}`}>
                                {isSelected ? 'Selected' : 'Available'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Calendar className="mx-auto mb-3 text-gray-300" size={48} />
                        <p className="text-gray-400 text-sm">
                          Select a day to view<br />available time slots
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedTimeSlot && (
                  <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={applySelectedTime}
                      className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <Clock size={18} />
                      Apply Selected Time
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Price Quote ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.priceQuote}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || parseFloat(value) >= 0) {
              handleInputChange("priceQuote", value);
            }
          }}
          onBlur={(e) => {
            const value = parseFloat(e.target.value);
            if (value < 0 || isNaN(value)) {
              handleInputChange("priceQuote", "0");
            }
          }}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary placeholder-gray-400"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Special Notes (Optional)
        </label>
        <textarea
          value={formData.specialNotes}
          onChange={(e) => handleInputChange("specialNotes", e.target.value)}
          rows="4"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary placeholder-gray-400 resize-none"
          placeholder="Any special instructions or requirements..."
        />
      </div>
    </div>
  );
};

export default BookingDetails;