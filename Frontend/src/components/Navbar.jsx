import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Calendar, QrCode, User, LogOut, Settings, Sun, Moon, ChevronDown, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rollNumber: user?.rollNumber || '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [eventStatus, setEventStatus] = useState({});

  const navigate = useNavigate();

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return '/default-avatar.png';
    if (profilePic.startsWith('/uploads/')) {
      return `http://localhost:5000${profilePic}`;
    }
    return profilePic;
  };

  const profilePicUrl = getProfilePicUrl(user?.profilePic);
  console.log('Navbar profilePicUrl:', profilePicUrl);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePicFile(file);
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append('name', profileForm.name);
    data.append('email', profileForm.email);
    if (user.role === 'student') data.append('rollNumber', profileForm.rollNumber);
    if (profilePicFile) data.append('profilePic', profilePicFile);
    const result = await updateProfile(data);
    setSaving(false);
    if (result.success) {
      toast.success('Profile updated!');
      setShowProfile(false);
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  // Fetch notifications for the logged-in user
  useEffect(() => {
    if (user) {
      setLoadingNotifications(true);
      fetch('https://college-event-pass-1.onrender.com/api/registrations/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => {
          setNotifications(data.notifications || []);
          setLoadingNotifications(false);
        })
        .catch(() => setLoadingNotifications(false));
    }
  }, [user]);

  // Fetch event status for notifications with eventId
  useEffect(() => {
    const fetchEventStatus = async () => {
      const status = {};
      for (const n of notifications) {
        if (n.eventId) {
          try {
            const res = await fetch(`https://college-event-pass-1.onrender.com/api/events/${n.eventId}`);
            if (res.ok) {
              const event = await res.json();
              status[n.eventId] = new Date(event.date) < new Date() ? 'finished' : 'active';
            } else {
              status[n.eventId] = 'deleted';
            }
          } catch {
            status[n.eventId] = 'deleted';
          }
        }
      }
      setEventStatus(status);
    };
    if (notifications.length > 0) fetchEventStatus();
  }, [notifications]);

  const handleMarkAsRead = async (id) => {
    await fetch(`https://college-event-pass-1.onrender.com/api/registrations/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notification) => {
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
    handleMarkAsRead(notification._id);
  };

  console.log('Navbar user:', user);

  return (
    <nav className={`sticky fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
              <div className="absolute -inset-1 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              EventPass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 hover:text-gray-800 transition-colors" />
              )}
            </button>

            {/* Navigation Links */}
            <Link 
              to="/" 
              className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
            >
              Events
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link 
                      to="/admin" 
                      className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                    >
                      Admin
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link 
                      to="/admin/scan" 
                      className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                    >
                      Scanner
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
                  >
                    Dashboard
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
                
                {/* Notification Bell */}
                {user && (
                  <div className="relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 relative"
                      aria-label="Show notifications"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-scaleIn">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                          Notifications
                        </div>
                        {loadingNotifications ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n._id}
                              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200
                                ${n.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30'}
                                ${(n.deleted || eventStatus[n.eventId] === 'deleted' || eventStatus[n.eventId] === 'finished') ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                              onClick={() => handleNotificationClick(n)}
                            >
                              <div className="text-sm text-gray-800 dark:text-gray-100">{n.message}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              {(n.deleted || eventStatus[n.eventId] === 'deleted') && <div className="text-xs text-red-400 mt-1">Event deleted</div>}
                              {eventStatus[n.eventId] === 'finished' && <div className="text-xs text-gray-400 mt-1">Event finished</div>}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                      {user.profilePic ? (
                        <img src={profilePicUrl + '?' + Date.now()} alt="Profile" className="h-8 w-8 rounded-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-1 border border-gray-200 dark:border-gray-700 transition-all duration-300 origin-top-right animate-scaleIn">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-6 w-6 text-yellow-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white dark:bg-gray-800 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            onClick={() => setIsOpen(false)}
          >
            Events
          </Link>
          
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link
                    to="/admin"
                    className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/scan"
                    className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    QR Scanner
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  My Dashboard
                </Link>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;