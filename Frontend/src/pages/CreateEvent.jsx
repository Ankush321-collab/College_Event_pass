import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, FileText, Image, Sun, Moon, Upload, Link } from 'lucide-react';

const CreateEvent = () => {
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    capacity: '',
    posterUrl: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Set dark mode based on user's system preference (no toggle)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
    const listener = (e) => setDarkMode(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    };
  }, []);

  // Fetch event data if editing
  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      (async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/events/${eventId}`);
          const event = res.data;
          setFormData({
            title: event.title || '',
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
            venue: event.venue || '',
            capacity: event.capacity ? String(event.capacity) : '',
            posterUrl: event.posterUrl || ''
          });
          setImagePreview(event.posterUrl || '');
          setUploadedImageUrl(event.posterUrl || '');
        } catch (err) {
          toast.error('Failed to fetch event details');
        }
      })();
    }
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large (max 5MB)');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await axios.post('http://localhost:5000/api/events/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: false
      });
      setUploadedImageUrl(res.data.url);
      setFormData(prev => ({ ...prev, posterUrl: res.data.url }));
      setImagePreview(res.data.url);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    setImageUrlInput(e.target.value);
    setUploadedImageUrl(''); // Clear uploaded image if user pastes a URL
    setFormData(prev => ({ ...prev, posterUrl: e.target.value }));
    setImagePreview(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        date: new Date(formData.date).toISOString()
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/events/${eventId}`, eventData);
        toast.success('Event updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/events', eventData);
        toast.success('Event created successfully!');
      }
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditMode ? 'Failed to update event' : 'Failed to create event'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        <div 
          className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-center mb-8">
                <div 
                  className={`inline-flex items-center justify-center p-4 rounded-full mb-4 transition-all duration-500 transform hover:rotate-6 ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}
                >
                  <Calendar 
                    className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} 
                    style={{ transform: 'translateZ(20px)' }}
                  />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  {isEditMode ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isEditMode ? 'Update the details of your event' : 'Fill in the details to create a new event'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label 
                    htmlFor="title" 
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Event Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="group">
                  <label 
                    htmlFor="description" 
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label 
                      htmlFor="date" 
                      className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>

                  <div className="group">
                    <label 
                      htmlFor="venue" 
                      className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Venue
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter event venue"
                    />
                  </div>
                </div>

                <div className="group">
                  <label 
                    htmlFor="capacity" 
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent group-hover:shadow-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter maximum capacity"
                  />
                </div>

                <div className="group">
                  <label 
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-hover:text-blue-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <Image className="h-4 w-4 inline mr-2" />
                    Event Poster
                  </label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Link className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={handleImageUrlChange}
                        className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Paste image URL here"
                        disabled={uploading}
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className={`px-2 text-sm ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                          OR
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Upload className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <label className="flex-1">
                        <span className={`sr-only`}>Choose event poster</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={`block w-full text-sm file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold transition-all duration-300 focus:outline-none ${darkMode ? 'file:bg-gray-700 file:text-blue-400 hover:file:bg-gray-600 text-gray-400' : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-500'}`}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    
                    {uploading && (
                      <div className={`p-2 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <span className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Uploading your image...</span>
                      </div>
                    )}
                    
                    {imagePreview && (
                      <div className="mt-4 transition-all duration-500 transform hover:scale-[1.02]">
                        <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preview:</div>
                        <img 
                          src={imagePreview} 
                          alt="Poster Preview" 
                          className="w-full max-h-60 object-contain rounded-lg shadow-md border border-opacity-20 border-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:-translate-x-1 hover:shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-lg text-sm font-medium text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl ${loading ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditMode ? 'Updating Event...' : 'Creating Event...'}
                      </div>
                    ) : (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Event' : 'Create Event'}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;