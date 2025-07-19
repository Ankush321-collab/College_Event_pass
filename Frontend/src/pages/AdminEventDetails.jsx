import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, X, Loader2, Download, Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminEventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      navigate('/admin');
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/registrations/event/${eventId}`);
      setRegistrations(response.data);
    } catch (error) {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/registrations/export/${eventId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return '/default-avatar.png';
    if (profilePic.startsWith('/uploads/')) {
      return `http://localhost:5000${profilePic}`;
    }
    return profilePic;
  };
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </motion.button>
        
        {event && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            disabled={exporting || registrations.length === 0}
            className={`flex items-center px-4 py-2 rounded-lg ${
              exporting || registrations.length === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
            } transition-all duration-200`}
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            Export CSV
          </motion.button>
        )}
      </div>

      {/* Event Details Card */}
      {event && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl dark:hover:shadow-gray-700/50 transition-shadow duration-300"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {event.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(event.date).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Venue</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.venue}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.currentRegistrations}/{event.capacity} ({Math.round((event.currentRegistrations / event.capacity) * 100)}%)
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Registrations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl dark:hover:shadow-gray-700/50"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Registered Students ({registrations.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center p-12 text-gray-500 dark:text-gray-400">
            No students have registered for this event yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registered At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {registrations.map((reg, idx) => (
                  <motion.tr
                    key={reg._id}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className="transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedUser(reg.studentId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <img
                        src={getProfilePicUrl(reg.studentId?.profilePic)}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                        onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                      />
                      {reg.studentId?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {reg.studentId?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {reg.studentId?.rollNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(reg.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.isScanned
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {reg.isScanned ? (
                          <span className="flex items-center">
                            <Check className="h-3 w-3 mr-1" /> Scanned
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <X className="h-3 w-3 mr-1" /> Pending
                          </span>
                        )}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setSelectedUser(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">✕</button>
            <div className="flex flex-col items-center mb-4">
              <img
                src={getProfilePicUrl(selectedUser.profilePic)}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400 mb-2"
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h3>
              <p className="text-gray-500 dark:text-gray-300">{selectedUser.email}</p>
              {selectedUser.rollNumber && (
                <p className="text-gray-500 dark:text-gray-300">Roll No: {selectedUser.rollNumber}</p>
              )}
            </div>
            {/* Add more user details here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventDetails;