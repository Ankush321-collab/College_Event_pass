import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rollNumber: user?.rollNumber || '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Update preview if user.profilePic changes (e.g., after refresh)
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePicPreview(user?.profilePic || null);
    }
  }, [user?.profilePic]);

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
      navigate(-1);
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return '/default-avatar.png';
    if (profilePic.startsWith('/uploads/')) {
      return `http://localhost:5000${profilePic}`;
    }
    return profilePic;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-section dark:bg-section text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={() => navigate(-1)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 mb-2">
              <img
                src={getProfilePicUrl(profilePicPreview)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
              <label htmlFor="profilePicUpload" className="absolute bottom-0 right-0 bg-blue-600 dark:bg-blue-400 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m2 2a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10z" /></svg>
                <input id="profilePicUpload" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </label>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Click camera to change</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400"
              required
            />
          </div>
          {user.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={profileForm.rollNumber}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-400"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 flex items-center justify-center hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 