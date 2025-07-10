import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Clock, ArrowLeft, QrCode } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check for user's preferred color scheme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setDarkMode(e.matches);
    });
  }, []);

  useEffect(() => {
    fetchEvent();
    if (user && user.role === 'student') {
      checkRegistration();
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to fetch event details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/registrations/my-registrations');
      const registration = response.data.find(reg => reg.eventId._id === id);
      setIsRegistered(!!registration);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await axios.post(`http://localhost:5000/api/registrations/${id}`);
      toast.success('Registration successful! Check your dashboard for the QR pass.');
      setIsRegistered(true);
      fetchEvent(); // Refresh event data to update capacity
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Event not found</h2>
          <button
            onClick={() => navigate('/')}
            className={`transition-colors duration-300 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            Go back to events
          </button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const spotsLeft = event.capacity - event.currentRegistrations;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center mb-6 transition-all duration-300 transform hover:-translate-x-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>

        <div 
          className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {event.posterUrl && (
            <div className="relative h-64 overflow-hidden group">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${darkMode ? 'from-gray-900/80 to-gray-800/20' : 'from-white/80 to-white/20'}`}></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${
                  isUpcoming 
                    ? darkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-100 text-green-800' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {isUpcoming ? 'Upcoming' : 'Past Event'}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              {!event.posterUrl && (
                <div>
                  <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${
                    isUpcoming 
                      ? darkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-100 text-green-800' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUpcoming ? 'Upcoming' : 'Past Event'}
                  </span>
                </div>
              )}
              
              {isUpcoming && user?.role === 'student' && (
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || spotsLeft === 0 || registering}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    isRegistered 
                      ? darkMode 
                        ? 'bg-green-900/30 text-green-300 cursor-not-allowed' 
                        : 'bg-green-100 text-green-800 cursor-not-allowed'
                      : spotsLeft === 0
                      ? darkMode 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : darkMode 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {registering ? (
                    <div className="flex items-center">
                      <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${darkMode ? 'border-white' : 'border-white'} mr-2`}></div>
                      Registering...
                    </div>
                  ) : isRegistered ? (
                    <>
                      <QrCode className="h-4 w-4 mr-2 inline" />
                      Registered
                    </>
                  ) : spotsLeft === 0 ? (
                    'Event Full'
                  ) : (
                    'Register Now'
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="group">
                <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Event Details
                </h2>
                <div className="space-y-4">
                  <div className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-opacity-20 hover:bg-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Calendar className={`h-5 w-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>
                      {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <div className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-opacity-20 hover:bg-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <MapPin className={`h-5 w-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>{event.venue}</span>
                  </div>
                  
                  <div className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-opacity-20 hover:bg-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Users className={`h-5 w-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>
                      {event.currentRegistrations}/{event.capacity} registered
                      {spotsLeft > 0 && ` (${spotsLeft} spots left)`}
                    </span>
                  </div>
                  
                  <div className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-opacity-20 hover:bg-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Clock className={`h-5 w-5 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>Created by {event.createdBy.name}</span>
                  </div>
                </div>
              </div>

              <div className="group">
                <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Registration Status
                </h2>
                <div className={`rounded-xl p-4 transition-all duration-300 ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700/70' : 'bg-blue-50 hover:bg-blue-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Capacity</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{event.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Registered</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{event.currentRegistrations}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{spotsLeft}</span>
                  </div>
                  
                  <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                      style={{ width: `${(event.currentRegistrations / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Description
              </h2>
              <div className={`prose max-w-none transition-colors duration-300 ${darkMode ? 'text-gray-300 prose-invert' : 'text-gray-700'}`}>
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {isRegistered && (
              <div className={`mt-8 p-4 rounded-xl border transition-all duration-300 ${darkMode ? 'bg-green-900/20 border-green-800/50 hover:bg-green-900/30' : 'bg-green-50 border-green-200 hover:bg-green-100'}`}>
                <div className="flex items-center">
                  <QrCode className={`h-6 w-6 mr-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-900'}`}>You're registered!</h3>
                    <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Visit your dashboard to view and download your QR pass.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;