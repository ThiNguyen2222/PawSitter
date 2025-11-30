// src/pages/owner/dashboard/TrustedSitters.jsx
import React, { useEffect, useState } from "react";
import { getSitters } from "../../../api/api";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, X, AlertCircle } from "lucide-react";
import API from "../../../api/api";

const SittersSection = () => {
  const [sitters, setSitters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [schedulePopup, setSchedulePopup] = useState(null);
  const [sitterSchedules, setSitterSchedules] = useState({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSitters() {
      try {
        const data = await getSitters();
        setSitters(data);
      } catch (error) {
        console.error("Error fetching sitters:", error);
      }
    }
    fetchSitters();
  }, []);

  const getSitterImageUrl = (sitter) => {
    if (sitter.profile_picture_url) {
      if (sitter.profile_picture_url.startsWith("http")) {
        return sitter.profile_picture_url;
      }
      const path = sitter.profile_picture_url.startsWith('/') 
        ? sitter.profile_picture_url 
        : `/${sitter.profile_picture_url}`;
      return `http://127.0.0.1:8000${path}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.display_name || 'Sitter')}&background=5d4233&color=fff&size=128`;
  };

  const loadSitterSchedule = async (sitter, e) => {
    e.stopPropagation();
    
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
    const startDate = new Date();
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

  return (
    <section className="container flex justify-between items-center py-8">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl text-primary font-semibold mb-8 text-center">
          Meet Our Trusted Pet Sitters
        </h2>

        {sitters.length === 0 ? (
          <p className="text-gray-600 text-center">No sitters available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitters.slice(0, visibleCount).map((sitter, index) => (
              <div
                key={sitter.id}
                onClick={() => navigate(`/sitter/${sitter.id}`)}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center 
               text-center transition-shadow duration-300 hover:shadow-xl 
               cursor-pointer"
              >
                <img
                  src={getSitterImageUrl(sitter)}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sitter.display_name || 'Sitter')}&background=5d4233&color=fff&size=128`;
                  }}
                  alt={sitter.display_name || "Pet sitter"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white mb-4"
                />

                <h3 className="text-xl font-semibold text-gray-800">
                  {sitter.display_name || "Unknown Sitter"}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Westminster, CA {sitter.home_zip || ""}
                </p>

                <div className="flex justify-center items-center gap-1 mb-3">
                  <span className="text-yellow-500 font-medium text-lg">
                    {"★".repeat(Math.round(sitter.avg_rating || 0))}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    {sitter.avg_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {sitter.tags?.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary/20 text-secondary text-xs font-semibold px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-primary font-semibold mb-2">
                  from ${sitter.rate_hourly || "?"}/night
                </p>
                
                <button
                  onClick={(e) => loadSitterSchedule(sitter, e)}
                  disabled={loadingSchedule}
                  className="bg-secondary text-white px-5 py-2 rounded-full hover:bg-secondary/80 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Calendar size={16} />
                  {loadingSchedule && !schedulePopup ? 'Loading...' : 'View Schedule'}
                </button>
              </div>
            ))}
          </div>
        )}

        {visibleCount < sitters.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/owner/find-sitters")}
              className="mt-6 bg-secondary text-white px-6 py-3 rounded-lg shadow-md hover:bg-secondary/80 transition font-bold"
            >
              View More Caregivers
            </button>
          </div>
        )}
      </div>

      {/* Schedule Popup Modal */}
      {schedulePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={24} className="text-primary" />
                  {schedulePopup.display_name}'s Availability
                </h3>
              </div>
              <button
                onClick={() => setSchedulePopup(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
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
                      className={`bg-white rounded-xl border border-gray-200 p-5 ${
                        !day.isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-gray-400 text-xs font-medium mb-1">
                            {day.dayName.toUpperCase()} • {day.month} {day.dayNumber}
                          </div>
                          <h5 className="text-gray-800 font-semibold text-base mb-2">
                            {day.isAvailable ? 'Available' : 'Not available'}
                          </h5>
                          {day.isAvailable && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Clock size={14} className="text-gray-400" />
                              <span>{day.totalHours}h total</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-gray-400 text-sm">
                          {idx === 0 ? 'Today' : `+${idx}d`}
                        </div>
                      </div>
                      
                      {day.isAvailable && day.openSlots.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {day.openSlots.map((slot, slotIdx) => {
                            const startTime = new Date(slot.start_ts);
                            const endTime = new Date(slot.end_ts);
                            const duration = (endTime - startTime) / (1000 * 60 * 60);
                            
                            return (
                              <div key={slotIdx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 font-medium">
                                  {formatTime(startTime)} - {formatTime(endTime)}
                                </span>
                                <span className="text-gray-500">
                                  {duration.toFixed(1)}h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SittersSection;