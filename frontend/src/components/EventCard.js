import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return eventDate >= today;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      {/* Placeholder Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm opacity-90">Event Image</p>
          </div>
        </div>
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isUpcoming(event.date) 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {event.name}
        </h3>
        
        <div className="space-y-2 text-gray-600 mb-4">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span className="text-sm line-clamp-1">{event.venue}</span>
          </div>

          {/* Registration Status */}
          <div className="flex items-center">
            <span className="mr-2">🎯</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              isUpcoming(event.date)
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isUpcoming(event.date) ? 'Registration Open' : 'Registration Closed'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Register Button - Show for upcoming events */}
          {isUpcoming(event.date) ? (
            <Link 
              to={`/events/${event.id}`}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Register Now</span>
            </Link>
          ) : (
            <div className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold text-center cursor-not-allowed flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Registration Closed</span>
            </div>
          )}

          {/* View Details Button */}
          <Link 
            to={`/events/${event.id}`}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>View Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;