import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, X, Check, XCircle } from 'lucide-react';
import { getBookings, confirmBooking, cancelBooking, completeBooking } from "../../api/api";


const SitterSchedule = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [bookings, setBookings] = useState({ active: [], upcoming: [], completed: [] });
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
      
      console.log('=== SCHEDULE DEBUG ===');
      console.log('Total bookings from API:', allBookings.length);
      console.log('All bookings:', allBookings);
      
      const now = new Date();
      console.log('Current time:', now);
      
      // Log all booking statuses
      const statusCounts = {};
      allBookings.forEach(b => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      });
      console.log('Bookings by status:', statusCounts);
      
      // Check for requested bookings regardless of date
      const allRequested = allBookings.filter(b => b.status === 'requested');
      console.log('All "requested" bookings (any date):', allRequested);
      
      // Active bookings: confirmed status, not yet ended
      const active = allBookings.filter(b => 
        b.status === 'confirmed' && new Date(b.end_ts) >= now
      );
      
      // Upcoming bookings: requested status waiting for confirmation
      const upcoming = allBookings.filter(b => {
        const isRequested = b.status === 'requested';
        const startTime = new Date(b.start_ts);
        const isFuture = startTime >= now;
        
        if (isRequested) {
          console.log(`Requested booking ${b.id}:`, {
            start_ts: b.start_ts,
            startTime,
            isFuture,
            owner: getOwnerName(b)
          });
        }
        
        return isRequested && isFuture;
      });
      
      // Completed bookings: completed status (show most recent first)
      const completed = allBookings
        .filter(b => b.status === 'completed')
        .sort((a, b) => new Date(b.end_ts) - new Date(a.end_ts))
        .slice(0, 10); // Show last 10 completed bookings
      
      console.log('📊 RESULTS:');
      console.log('Active (confirmed, future):', active.length);
      console.log('Upcoming (requested, future):', upcoming.length);
      console.log('Completed:', completed.length);
      console.log('=== END DEBUG ===');
      
      setBookings({ active, upcoming, completed });
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-[#5B8DBE] text-white',
      requested: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      canceled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Confirmed',
      requested: 'Requested',
      completed: 'Completed',
      canceled: 'Canceled'
    };
    return labels[status] || status;
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
      
      // Refresh schedule after update
      await fetchSchedule();
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking. Please try again.');
    }
  };

  const getOwnerName = (booking) => {
    // Handle different possible response structures from your backend
    if (booking.owner?.user) {
      const user = booking.owner.user;
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown Owner';
    }
    return 'Unknown Owner';
  };

  const getOwnerUsername = (booking) => {
    return booking.owner?.user?.username || '';
  };

  const BookingCard = ({ booking }) => (
    <div
      onClick={() => setSelectedBooking(booking)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-primary">
              {getOwnerName(booking)}
            </span>
            {getOwnerUsername(booking) && (
              <span className="text-gray-500 text-sm">@{getOwnerUsername(booking)}</span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {formatDate(booking.start_ts)} - {booking.start_ts.split('T')[0] === booking.end_ts.split('T')[0] ? 'Same day' : formatDate(booking.end_ts)}
          </div>
          
          <div className="text-sm text-gray-500">
            {formatTime(booking.start_ts)} - {formatTime(booking.end_ts)}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {booking.pet_details?.length || 0} {booking.pet_details?.length === 1 ? 'Pet' : 'Pets'}
            {booking.pet_details && booking.pet_details.length > 0 && `: ${booking.pet_details.map(p => p.name).join(', ')}`}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-primary mb-1">
            ${booking.price_quote}
          </div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>
    </div>
  );

  const ScheduleDetails = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">Schedule Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Owner</span>
              </div>
              <div className="ml-7">
                <div className="font-semibold text-primary">
                  {getOwnerName(booking)}
                </div>
                {getOwnerUsername(booking) && (
                  <div className="text-sm text-gray-600">@{getOwnerUsername(booking)}</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Schedule</span>
              </div>
              <div className="ml-7">
                <div className="text-primary">
                  <div className="font-medium">Check-in</div>
                  <div className="text-sm">{formatDate(booking.start_ts)} at {formatTime(booking.start_ts)}</div>
                </div>
                <div className="text-primary mt-2">
                  <div className="font-medium">Check-out</div>
                  <div className="text-sm">{formatDate(booking.end_ts)} at {formatTime(booking.end_ts)}</div>
                </div>
              </div>
            </div>

            {booking.pet_details && booking.pet_details.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Pets</div>
                <div className="ml-0 space-y-2">
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
              <div className="ml-0 text-primary">{getServiceLabel(booking.service_type)}</div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Earning</span>
              </div>
              <div className="ml-7 text-xl font-semibold text-primary">${booking.price_quote}</div>
            </div>

            {booking.status === 'requested' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3">Update this schedule?</div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                    className="w-full bg-[#5B8DBE] text-white py-2 px-4 rounded-lg hover:bg-[#4A7BA8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept Booking
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, 'canceled')}
                    className="w-full bg-white text-red-600 py-2 px-4 rounded-lg border border-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline Booking
                  </button>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark as Completed
                </button>
              </div>
            )}

            {booking.status === 'completed' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>This booking has been completed</span>
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
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-5 w-[90%] mx-auto">
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary">Schedule</h1>
            </div>

            {error && !selectedBooking && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'active'
                        ? 'text-[#5B8DBE] border-b-2 border-[#5B8DBE]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'upcoming'
                        ? 'text-[#5B8DBE] border-b-2 border-[#5B8DBE]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                      activeTab === 'completed'
                        ? 'text-[#5B8DBE] border-b-2 border-[#5B8DBE]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading schedule...</div>
                ) : (
                  <>
                    {activeTab === 'active' && (
                      <div>
                        {bookings.active.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <p className="mb-2">No active bookings</p>
                            <p className="text-sm">Confirmed bookings will appear here</p>
                          </div>
                        ) : (
                          bookings.active.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'upcoming' && (
                      <div>
                        {bookings.upcoming.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <p className="mb-2">No upcoming requests</p>
                            <p className="text-sm">Booking requests waiting for your confirmation will appear here</p>
                          </div>
                        ) : (
                          bookings.upcoming.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'completed' && (
                      <div>
                        {bookings.completed.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <p className="mb-2">No completed bookings</p>
                            <p className="text-sm">Your booking history will appear here</p>
                          </div>
                        ) : (
                          bookings.completed.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                          ))
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
      </div>
    </div>
  );
};

export default SitterSchedule;