import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext'; // Add this import

const BookingModal = ({ event, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useUser(); // Add this line to get logged-in user
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '' // Remove email from initial state
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    setError('');
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Please enter a valid name (at least 2 characters)';
    }
    
    // Phone validation (now required since email is removed)
    if (!formData.phone || formData.phone.length < 10) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
    if (!user?.email) {
      setError('You must be logged in to book an event');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Submitting booking for event:', event.id);
      console.log('Form data:', formData);
      console.log('User email:', user.email);

      const response = await axios.post(
        `http://localhost:3000/api/events/${event.id}/book`,
        {
          name: formData.name.trim(),
          email: user.email, // Use logged-in user's email
          phone: formData.phone.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      console.log('Booking successful:', response.data);
      
      // Success
      onBookingSuccess(response.data);
      setFormData({ name: '', phone: '' }); // Reset form (no email field)
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection and try again.');
      } else if (err.response) {
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', phone: '' }); // Reset form (no email field)
      setError('');
      setValidationErrors({});
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Book Event</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">{event.name}</h3>
          <p className="text-gray-600 text-sm">{event.venue}</p>
        </div>

        {/* Show logged-in user's email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (from your account)
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
          />
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
              disabled={isSubmitting}
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
