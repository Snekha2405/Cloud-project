import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../components/UserContext'; // Add this import

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useUser(); // Add this line

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              College Events
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-600 hover:text-primary hover:bg-primary/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/events') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-600 hover:text-primary hover:bg-primary/10'
              }`}
            >
              All Events
            </Link>
            
            {/* User-specific navigation */}
            {user ? (
              <>
                <Link
                  to="/bookings"
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/bookings') 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  My Bookings
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 hidden lg:block">
                    Welcome, <span className="font-semibold text-primary">{user.name}</span>
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-600 hover:text-primary hover:bg-primary/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 shadow-md"
                >
                  Register
                </Link>
              </>
            )}
            
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/contact') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-600 hover:text-primary hover:bg-primary/10'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/events') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                All Events
              </Link>
              
              {/* Mobile User Navigation */}
              {user ? (
                <>
                  <Link
                    to="/bookings"
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive('/bookings') 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    My Bookings
                  </Link>
                  <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                    Welcome, <span className="font-semibold text-primary">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mx-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="mx-4 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 text-center"
                  >
                    Register
                  </Link>
                </>
              )}
              
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/contact') 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                Contact
              </Link>
              <Link 
  to="/admin/login" 
  className="text-gray-600 hover:text-gray-900"
>
  Admin
</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
