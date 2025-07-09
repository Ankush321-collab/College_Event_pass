import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, QrCode, Users, Zap } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    if (user && user.role === 'student') {
      fetchRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/registrations/my-registrations');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/registrations/${eventId}`);
      toast.success('Registration successful!');
      fetchEvents();
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const isRegistered = (eventId) => {
    return registrations.some(reg => reg.eventId._id === eventId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              College Event Manager
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Register for events and get instant QR passes
            </p>
            <div className="flex justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 mr-2" />
                <span>Easy Registration</span>
              </div>
              <div className="flex items-center">
                <QrCode className="h-8 w-8 mr-2" />
                <span>QR Passes</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-8 w-8 mr-2" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and register for exciting college events. Get your QR pass instantly!
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={user?.role === 'student' ? handleRegister : null}
                isRegistered={isRegistered(event._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EventPass?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Technology</h3>
              <p className="text-gray-600">
                Get instant QR passes that can be scanned at event entry for seamless access
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Registration</h3>
              <p className="text-gray-600">
                Simple one-click registration process for all your favorite college events
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about event updates and important announcements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;