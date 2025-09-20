// Fallback avatar from a reliable CDN
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff';

export const getProfilePicUrl = (profilePic) => {
  if (!profilePic) {
    return '/default-avatar.svg';
  }
  
  if (profilePic.startsWith('/uploads/')) {
    return `https://college-event-pass-1.onrender.com${profilePic}`;
  }
  
  return profilePic;
};

export const handleAvatarError = (e) => {
  e.target.onerror = null; // Prevent infinite loop
  if (e.target.src.includes('default-avatar.svg')) {
    // If default avatar fails, use the fallback
    e.target.src = FALLBACK_AVATAR;
  } else {
    // If original image fails, try default avatar first
    e.target.src = '/default-avatar.svg';
  }
};