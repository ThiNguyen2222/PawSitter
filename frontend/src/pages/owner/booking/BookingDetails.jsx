import React, { useState, useEffect } from "react";
import { Star, Calendar, Clock, X, AlertCircle, Award, PawPrint } from "lucide-react";
import API from "../../../api/api";

const BookingDetails = ({ formData, handleInputChange, sitters }) => {
  const [schedulePopup, setSchedulePopup] = useState(null);
  const [availableSitters, setAvailableSitters] = useState(sitters);
  const [sitterSchedules, setSitterSchedules] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [filteringAvailability, setFilteringAvailability] = useState(false);

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

      const hasAvailability = availabilitySlots.some(slot => {
        if (slot.status !== 'open') return false;
        
        const slotStart = new Date(slot.start_ts);
        const slotEnd = new Date(slot.end_ts);
        
        return slotStart <= requestStart && slotEnd >= requestEnd;
      });

      return hasAvailability;
    } catch (error) {
      console.error(`Error checking availability for sitter ${sitterId}:`, error);
      return true;
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

  const getPetTypes = (sitter) => {
    if (!sitter.tags || sitter.tags.length === 0) return [];
    return sitter.tags.filter(tag => 
      ['dogs', 'cats', 'birds', 'reptiles', 'small_animals', 'fish'].includes(tag.toLowerCase())
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-2">
          Booking Details
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a sitter and fill in your booking info
        </p>
      </div>

      {/* Date and Time Grid */}
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

      {/* Sitters */}
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
                  {/* Header with Name and Rating */}
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

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {sitter.bio || 'No bio provided'}
                  </p>

                  {/* Pet Types */}
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

                  {/* Specialties */}
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

                  {/* Price and Status Row */}
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

                  {/* View Schedule Button */}
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

      {/* Schedule Popup Modal */}
      {schedulePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-primary">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar size={24} />
                  {schedulePopup.display_name}'s Schedule
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  Weekly availability overview
                </p>
              </div>
              <button
                onClick={() => setSchedulePopup(null)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {sitterSchedules[schedulePopup.id]?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
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
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition shadow-sm ${
                        day.isToday
                          ? 'bg-blue-50 border-blue-400 shadow-md'
                          : day.isAvailable
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px] bg-white rounded-lg p-2 shadow-sm">
                          <div className="text-xs text-gray-600 font-semibold uppercase">
                            {day.dayName}
                          </div>
                          <div className="text-2xl font-bold text-gray-800">
                            {day.dayNumber}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {day.month}
                          </div>
                        </div>
                        <div>
                          {day.isAvailable ? (
                            <div>
                              <div className="text-green-700 font-bold text-lg">
                                Available
                              </div>
                              <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {day.totalHours}h
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>{day.openSlots.length} slot{day.openSlots.length > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500 font-semibold">
                              Not available
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${
                        day.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSchedulePopup(null)}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Quote */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Price Quote ($)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.priceQuote}
          onChange={(e) => handleInputChange("priceQuote", e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary placeholder-gray-400"
          placeholder="0.00"
        />
      </div>

      {/* Special Notes */}
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