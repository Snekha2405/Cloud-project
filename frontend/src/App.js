import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Contact from './pages/Contact';
import Login from './components/Login';
import Register from './components/Register';
import MyBookings from './pages/MyBookings';
// import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './components/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ViewRegistrations from './components/ViewRegistrations'; 
import CreateEvent from './components/CreateEvent';
import EventChatbot from './components/EventChatbot';

import './index.css';

function App() {
  return (
    <UserProvider>
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/create-event" element={<CreateEvent />} />
<Route path="/admin/registrations" element={<ViewRegistrations />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/bookings" element={<MyBookings />} />
              </Route>
          </Routes>
        </main>
        <Footer />
        <EventChatbot />
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;
