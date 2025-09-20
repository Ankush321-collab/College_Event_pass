import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Register
router.post('/register', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, email, password, rollNumber, role } = req.body;
    let profilePic = null;
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'college_event_pass/profiles',
        resource_type: 'auto'
      });
      profilePic = result.secure_url;
    }

    // Check if user already exists
    const sanitizedRoll = typeof rollNumber === 'string' ? rollNumber.trim() : undefined;
    const orConditions = [{ email }];
    if ((role === 'student') && sanitizedRoll) {
      orConditions.push({ rollNumber: sanitizedRoll });
    }
    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      rollNumber: (role === 'student' && sanitizedRoll) ? sanitizedRoll : undefined,
      role: role || 'student',
      profilePic
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.rollNumber) updates.rollNumber = req.body.rollNumber;
    
    if (req.file) {
      // Delete old profile picture from Cloudinary if exists
      if (req.user.profilePic && req.user.profilePic.includes('cloudinary')) {
        try {
          const publicId = req.user.profilePic.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }

      // Upload new profile picture to Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'college_event_pass/profiles',
        resource_type: 'auto'
      });
      updates.profilePic = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error('Me route error:', err);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

export default router;