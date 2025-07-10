import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Calendar, Users, QrCode, BarChart3, ChevronRight, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttended: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

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

  const fetchStats = async () => {
    try {
      const eventsResponse = await axios.get('http://localhost:5000/api/events');
      const events = eventsResponse.data;
      
      let totalRegistrations = 0;
      let totalAttended = 0;

      for (const event of events) {
        const registrationsResponse = await axios.get(`http://localhost:5000/api/registrations/event/${event._id}`);
        const registrations = registrationsResponse.data;
        
        totalRegistrations += registrations.length;
        totalAttended += registrations.filter(reg => reg.isScanned).length;
      }

      setStats({
        totalEvents: events.length,
        totalRegistrations,
        totalAttended
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${eventId}`);
        toast.success('Event deleted successfully');
        fetchEvents();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 p-6 mb-8 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <Link 
              to="/admin/create-event"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              icon: <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
              bg: "bg-blue-100 dark:bg-blue-900/30",
              title: "Total Events",
              value: stats.totalEvents
            },
            { 
              icon: <Users className="h-6 w-6 text-green-600 dark:text-green-400" />,
              bg: "bg-green-100 dark:bg-green-900/30",
              title: "Total Registrations",
              value: stats.totalRegistrations
            },
            { 
              icon: <QrCode className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
              bg: "bg-purple-100 dark:bg-purple-900/30",
              title: "Total Attended",
              value: stats.totalAttended
            },
            { 
              icon: <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
              bg: "bg-orange-100 dark:bg-orange-900/30",
              title: "Attendance Rate",
              value: stats.totalRegistrations > 0 
                ? Math.round((stats.totalAttended / stats.totalRegistrations) * 100) 
                : 0,
              suffix: "%"
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg dark:hover:shadow-gray-700/50 p-6 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className={`${stat.bg} rounded-full p-3 mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}{stat.suffix || ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 p-6 mb-8 transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link 
              to="/admin/create-event"
              className="group relative bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                <div className="bg-white/20 rounded-full p-3 mr-4">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Create New Event</h3>
                  <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
                    Add a new event for students to register
                  </p>
                </div>
              </div>
              <ChevronRight className="absolute right-5 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link 
              to="/admin/scan"
              className="group relative bg-gradient-to-r from-green-600 to-green-500 text-white p-5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                <div className="bg-white/20 rounded-full p-3 mr-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Scan QR Codes</h3>
                  <p className="text-sm text-green-100 dark:text-green-200 mt-1">
                    Verify student entries at events
                  </p>
                </div>
              </div>
              <ChevronRight className="absolute right-5 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-gray-700/50 p-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Events</h2>
            <Link 
              to="/admin/create-event"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first event to get started!</p>
              <Link 
                to="/admin/create-event"
                className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                  <EventCard event={event} />
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link 
                      to={`/admin/event/${event._id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Registrations
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;