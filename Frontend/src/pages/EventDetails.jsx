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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {event.posterUrl && (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isUpcoming ? 'Upcoming' : 'Past Event'}
                </span>
              </div>
              
              {isUpcoming && user?.role === 'student' && (
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || spotsLeft === 0 || registering}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    isRegistered 
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : spotsLeft === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {registering ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>
                      {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{event.venue}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>
                      {event.currentRegistrations}/{event.capacity} registered
                      {spotsLeft > 0 && ` (${spotsLeft} spots left)`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>Created by {event.createdBy.name}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Status</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Capacity</span>
                    <span className="font-medium">{event.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Registered</span>
                    <span className="font-medium">{event.currentRegistrations}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Available</span>
                    <span className="font-medium">{spotsLeft}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.currentRegistrations / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {isRegistered && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <QrCode className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-900">You're registered!</h3>
                    <p className="text-sm text-green-700">
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