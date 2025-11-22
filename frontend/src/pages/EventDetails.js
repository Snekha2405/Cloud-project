import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../components/BookingModal';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const addToCalendar = () => {
    if (!event) return;
    
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(event.name);
    const location = encodeURIComponent(event.venue);
    const details = encodeURIComponent(event.description || 'College Event');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&location=${location}&details=${details}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleBookingSuccess = (bookingData) => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return eventDate >= today;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/events" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            <span>Event registered successfully! You'll receive a confirmation email shortly.</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link 
        to="/events"
        className="inline-flex items-center text-blue-500 hover:text-purple-600 transition-colors mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl md:text-8xl mb-4">🎉</div>
                <p className="text-lg opacity-90">Event Image</p>
              </div>
            </div>
            {/* Registration Status Badge */}
            {isUpcoming(event.date) && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Registration Open
                </span>
              </div>
            )}
          </div>

          {/* Event Content */}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              {event.name}
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Date</h3>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Venue</h3>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Status</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      isUpcoming(event.date)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isUpcoming(event.date) ? 'Upcoming Event' : 'Past Event'}
                    </span>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Registration</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      isUpcoming(event.date)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isUpcoming(event.date) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {event.description || 'Join us for this exciting college event! More details will be available soon. Don\'t miss out on this amazing opportunity to connect with fellow students and faculty members.'}
                </p>
              </div>
            </div>

            {/* Action Buttons - MAIN REGISTRATION SECTION */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isUpcoming(event.date) ? 'Ready to Join Us?' : 'Event Has Ended'}
                </h3>
                <p className="text-gray-600">
                  {isUpcoming(event.date) 
                    ? 'Register now to secure your spot at this amazing event!'
                    : 'This event has already taken place. Stay tuned for future events!'
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                {/* MAIN REGISTRATION BUTTON */}
                {isUpcoming(event.date) ? (
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Register Now</span>
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 cursor-not-allowed">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Registration Closed</span>
                  </div>
                )}
                
                {/* Add to Calendar Button */}
                <button
                  onClick={addToCalendar}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>

            {/* Call to Action for Upcoming Events */}
            {isUpcoming(event.date) && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Don't Miss Out!</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Secure your spot at this amazing event. Registration is quick and easy!
                  </p>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Quick Register Here</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <BookingModal
        event={event}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default EventDetails;