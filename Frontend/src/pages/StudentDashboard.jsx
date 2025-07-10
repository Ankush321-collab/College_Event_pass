import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QrCode, Download, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/registrations/my-registrations');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (qrCodeImage, eventTitle) => {
    const link = document.createElement('a');
    link.download = `${eventTitle}-QR-Pass.png`;
    link.href = qrCodeImage;
    link.click();
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}!</h1>
              <p className="text-gray-600 dark:text-gray-300">Roll Number: {user?.rollNumber}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 transition-all duration-300 hover:scale-110">
              <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mr-4 transition-all duration-300 hover:rotate-12">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{registrations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4 transition-all duration-300 hover:rotate-12">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Attended</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {registrations.filter(reg => reg.isScanned).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mr-4 transition-all duration-300 hover:rotate-12">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {registrations.filter(reg => new Date(reg.eventId.date) > new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Passes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Event Passes</h2>
          
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <QrCode className="h-12 w-12 text-gray-400 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No registrations yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Browse events and register to get your QR passes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((registration) => {
                const eventDate = new Date(registration.eventId.date);
                const isUpcoming = eventDate > new Date();
                
                return (
                  <div 
                    key={registration._id} 
                    className="border dark:border-gray-700 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-500/30 dark:hover:border-blue-400/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{registration.eventId.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                        registration.isScanned 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : isUpcoming 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {registration.isScanned ? 'Attended' : isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {eventDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {registration.eventId.venue}
                      </div>
                      {registration.isScanned && (
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Scanned at {new Date(registration.scannedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 transition-all duration-300 hover:scale-[1.02]">
                      <img 
                        src={registration.qrCodeImage} 
                        alt="QR Code" 
                        className="w-full h-32 object-contain"
                      />
                    </div>
                    
                    <button
                      onClick={() => downloadQR(registration.qrCodeImage, registration.eventId.title)}
                      className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 flex items-center justify-center hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Pass
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;