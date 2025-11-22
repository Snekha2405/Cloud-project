import React, { useState, useEffect } from 'react';
import { useUser } from '../components/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
  try {
    console.log('Fetching bookings for email:', user.email); // Check email being sent
    const response = await axios.get(`http://localhost:3000/api/bookings/${user.email}`);
    console.log('API Response:', response.data); // Check full response
    console.log('Bookings array:', response.data.bookings); // Check bookings array
    setBookings(response.data.bookings);
    setLoading(false);
  } catch (err) {
    console.error('Fetch error:', err); // Check for any errors
    setError('Failed to fetch your bookings');
    setLoading(false);
  }
};

const cancelBooking = async (bookingId) => {
  if (!window.confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    // Use the new URL pattern
    const response = await axios.delete(`http://localhost:3000/api/bookings/cancel/${bookingId}`, {
      data: { email: user.email },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    setBookings(bookings.filter(booking => booking.id !== bookingId));
    alert('Booking cancelled successfully');
  } catch (err) {
    console.error('Cancel booking error:', err);
    alert('Failed to cancel booking: ' + (err.response?.data?.error || 'Unknown error'));
  }
};





  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Link to="/events" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
          <Link to="/events" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-xl font-semibold mb-3">{booking.eventName}</h3>
              
              <div className="space-y-2 mb-4">
                <p><strong>Date:</strong> {formatDate(booking.eventDate)}</p>
                <p><strong>Venue:</strong> {booking.eventVenue}</p>
                <p><strong>Booked on:</strong> {formatDate(booking.bookingDate)}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </p>
              </div>

              {isUpcoming(booking.eventDate) && (
                <button
                  onClick={() => cancelBooking(booking.id)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
