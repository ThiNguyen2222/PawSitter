import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, X, Check, XCircle, Edit2 } from 'lucide-react';
import { getBookings, confirmBooking, cancelBooking, completeBooking } from "../../api/api";

const SitterSchedule = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState({ upcoming: [], active: [], completed: [] });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const allBookings = await getBookings();
      const now = new Date();
      
      // Upcoming bookings: requested status waiting for confirmation
      const upcoming = allBookings.filter(b => 
        b.status === 'requested' && new Date(b.start_ts) >= now
      );
      
      // Active bookings: confirmed status, not yet ended
      const active = allBookings.filter(b => 
        b.status === 'confirmed' && new Date(b.end_ts) >= now
      );
      
      // Completed bookings: completed status (show most recent first)
      const completed = allBookings
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.end_ts) - new Date(a.end_ts))
        .slice(0, 20);
      
      setBookings({ upcoming, active, completed });
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const getServiceLabel = (serviceType) => {
    const labels = {
      house_sitting: 'House Sitting',
      pet_boarding: 'Pet Boarding',
      in_home_visit: 'In-Home Visit',
      pet_grooming: 'Pet Grooming',
      pet_walking: 'Pet Walking'
    };
    return labels[serviceType] || serviceType;
  };

  const getOwnerName = (booking) => {
    if (booking.owner?.user) {
      const user = booking.owner.user;
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown Owner';
    }
    return 'Unknown Owner';
  };

  const getPetInfo = (booking) => {
    if (!booking.pet_details || booking.pet_details.length === 0) {
      return 'No pets specified';
    }
    const petTypes = booking.pet_details.map(pet => pet.species || 'pet').join('/');
    return petTypes;
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setError(null);
      
      if (newStatus === 'confirmed') {
        await confirmBooking(bookingId);
      } else if (newStatus === 'canceled') {
        await cancelBooking(bookingId);
      } else if (newStatus === 'completed') {
        await completeBooking(bookingId);
      }
      
      await fetchSchedule();
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking. Please try again.');
    }
  };

  const BookingRow = ({ booking, showActions = false }) => (
    <div className="flex items-center py-5 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Date Range */}
      <div className="w-48 flex-shrink-0">
        <div className="text-primary font-medium">{formatDateRange(booking.start_ts, booking.end_ts)}</div>
      </div>

      {/* Owner Name and Service */}
      <div className="flex-1 min-w-0 px-4">
        <div className="text-primary font-medium truncate">{getOwnerName(booking)}</div>
        <div className="text-gray-500 text-sm">{getServiceLabel(booking.service_type)}</div>
      </div>

      {/* Pet Info */}
      <div className="w-48 flex-shrink-0 px-4">
        <div className="text-primary font-medium">{getPetInfo(booking)}</div>
      </div>

      {/* Booking Value */}
      <div className="w-40 flex-shrink-0 text-right">
        <div className="text-primary font-semibold text-lg">${booking.price_quote}</div>
        <div className="text-gray-500 text-sm">Booking value</div>
      </div>

      {/* Action Buttons */}
      <div className="w-56 flex-shrink-0 flex items-center justify-end gap-2">
        {showActions && booking.status === 'requested' && (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
            className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Approve</span>
          </button>
        )}
        
        {!showActions && booking.status === 'confirmed' && (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'completed')}
            className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Complete</span>
          </button>
        )}

        <button 
          onClick={() => setSelectedBooking(booking)}
          className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        {booking.status !== 'completed' && (
          <button
            onClick={() => handleUpdateStatus(booking.id, 'canceled')}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div
      onClick={() => setSelectedBooking(booking)}
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-primary text-lg">
              {getOwnerName(booking)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {formatDate(booking.start_ts)} - {booking.start_ts.split('T')[0] === booking.end_ts.split('T')[0] ? 'Same day' : formatDate(booking.end_ts)}
          </div>
          
          <div className="text-sm text-gray-500 mb-3">
            {formatTime(booking.start_ts)} - {formatTime(booking.end_ts)}
          </div>
          
          <div className="text-sm text-gray-600">
            {booking.pet_details?.length || 0} {booking.pet_details?.length === 1 ? 'Pet' : 'Pets'}
            {booking.pet_details && booking.pet_details.length > 0 && `: ${booking.pet_details.map(p => p.name).join(', ')}`}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-semibold text-primary mb-2">
            ${booking.price_quote}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' ? 'bg-secondary/10 text-secondary' :
            booking.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
            booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {booking.status === 'confirmed' ? 'Confirmed' :
             booking.status === 'requested' ? 'Requested' :
             booking.status === 'completed' ? 'Completed' : booking.status}
          </span>
        </div>
      </div>
    </div>
  );

  const ScheduleDetails = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between rounded-t-xl">
            <h3 className="text-xl font-bold text-primary">Booking Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Owner</span>
              </div>
              <div className="ml-7">
                <div className="font-semibold text-primary text-lg">
                  {getOwnerName(booking)}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Schedule</span>
              </div>
              <div className="ml-7 space-y-3">
                <div className="text-primary">
                  <div className="font-medium">Check-in</div>
                  <div className="text-sm text-gray-600">{formatDate(booking.start_ts)} at {formatTime(booking.start_ts)}</div>
                </div>
                <div className="text-primary">
                  <div className="font-medium">Check-out</div>
                  <div className="text-sm text-gray-600">{formatDate(booking.end_ts)} at {formatTime(booking.end_ts)}</div>
                </div>
              </div>
            </div>

            {booking.pet_details && booking.pet_details.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-3">Pets</div>
                <div className="space-y-2">
                  {booking.pet_details.map(pet => (
                    <div key={pet.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-primary">{pet.name}</div>
                      <div className="text-sm text-gray-600">{pet.species} - {pet.breed}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Service</div>
              <div className="text-primary font-medium">{getServiceLabel(booking.service_type)}</div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Payment</span>
              </div>
              <div className="ml-7 text-2xl font-bold text-primary">${booking.price_quote}</div>
            </div>

            {booking.status === 'requested' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3">Update this booking?</div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                    className="w-full bg-secondary text-white py-3 px-4 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Check className="w-5 h-5" />
                    Accept Booking
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'canceled')}
                    className="w-full bg-white text-red-600 py-3 px-4 rounded-lg border-2 border-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline Booking
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                  className="w-full bg-secondary text-white py-3 px-4 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Check className="w-5 h-5" />
                  Mark as Completed
                </button>
              </div>
            )}

            {booking.status === 'completed' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-secondary/10 border border-secondary text-secondary px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">This booking has been completed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0e6e4] to-white pt-24 pb-12">
      <div className="flex flex-col lg:flex-row gap-5 w-[80%] mx-auto">
        <div className="w-full">
          {/* <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Your Schedule</h1>
          </div> */}

          {error && !selectedBooking && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-8 border-b border-gray-300">
              <button
                onClick={() => setActiveTab('active')}
                className={`pb-3 font-medium text-base transition-colors ${
                  activeTab === 'active'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-3 font-medium text-base transition-colors ${
                  activeTab === 'completed'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Complete
              </button>
            </div>
          </div>

          <div>
            {loading ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                  <p>Loading schedule...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'active' && (
                    <div>
                      {/* Approve Booking Section */}
                      {bookings.upcoming.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-primary mb-4">Approve Booking</h2>
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {bookings.upcoming.map(booking => (
                              <BookingRow key={booking.id} booking={booking} showActions={true} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Schedule Section */}
                      <div>
                        <h2 className="text-2xl font-bold text-primary mb-4">Active Schedule</h2>
                        {bookings.active.length === 0 ? (
                          <div className="text-center py-16 text-gray-500">
                            <p className="text-lg mb-2">No active bookings</p>
                            <p className="text-sm">Confirmed bookings will appear here</p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {bookings.active.map(booking => (
                              <BookingRow key={booking.id} booking={booking} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Empty state when both sections are empty */}
                      {bookings.upcoming.length === 0 && bookings.active.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-xl font-medium mb-2">No active bookings</p>
                          <p className="text-sm">Your upcoming and active bookings will appear here</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div>
                      {bookings.completed.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-xl font-medium mb-2">No completed bookings</p>
                          <p className="text-sm">Your booking history will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookings.completed.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <ScheduleDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};

export default SitterSchedule;