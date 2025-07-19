import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, QrCode, Users, Zap, ChevronRight } from 'lucide-react';

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
    return registrations.some(reg => reg.eventId && reg.eventId._id === eventId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              College <span className="text-blue-200 dark:text-blue-300">Event</span> Manager
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Register for events and get instant QR passes with our seamless platform
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-blue-100 dark:text-blue-200">
              <div className="flex items-center bg-white/10 dark:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Calendar className="h-6 w-6 mr-2" />
                <span>Easy Registration</span>
              </div>
              <div className="flex items-center bg-white/10 dark:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <QrCode className="h-6 w-6 mr-2" />
                <span>QR Passes</span>
              </div>
              <div className="flex items-center bg-white/10 dark:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Zap className="h-6 w-6 mr-2" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and register for exciting college events. Get your QR pass instantly!
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No events yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for upcoming events!</p>
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
      <div className="bg-white dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose <span className="text-blue-600 dark:text-blue-400">EventPass</span>?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides the best experience for event management and attendance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-600">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">QR Code Technology</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Get instant QR passes that can be scanned at event entry for seamless access
              </p>
              <div className="mt-4 flex justify-center">
                <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            <div className="group bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-600">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Easy Registration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Simple one-click registration process for all your favorite college events
              </p>
              <div className="mt-4 flex justify-center">
                <ChevronRight className="h-5 w-5 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            <div className="group bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-600">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Real-time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Get instant notifications about event updates and important announcements
              </p>
              <div className="mt-4 flex justify-center">
                <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience seamless event management?</h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-3xl mx-auto">
            Join thousands of students who are already using EventPass for their event needs
          </p>
          <button className="bg-white text-blue-600 dark:text-blue-800 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;