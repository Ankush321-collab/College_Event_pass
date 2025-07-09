import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const AdminEventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
    // eslint-disable-next-line
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        className="flex items-center mb-6 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5 mr-1" /> Back
      </button>
      {event && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleString()}</p>
          <p className="text-gray-600 mb-1">Venue: {event.venue}</p>
          <p className="text-gray-600 mb-1">Capacity: {event.capacity}</p>
        </div>
      )}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Registered Students</h3>
        {loading ? (
          <div>Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="text-gray-500">No students have registered for this event yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Roll Number</th>
                  <th className="px-4 py-2 border">Registered At</th>
                  <th className="px-4 py-2 border">Scanned</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={reg._id} className="text-center">
                    <td className="px-4 py-2 border">{idx + 1}</td>
                    <td className="px-4 py-2 border">{reg.studentId?.name || '-'}</td>
                    <td className="px-4 py-2 border">{reg.studentId?.email || '-'}</td>
                    <td className="px-4 py-2 border">{reg.studentId?.rollNumber || '-'}</td>
                    <td className="px-4 py-2 border">{new Date(reg.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      {reg.isScanned ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventDetails;
