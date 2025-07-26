import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

// Multer setup for profile picture upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Register
router.post('/register', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, email, password, rollNumber, role } = req.body;
    let profilePic = null;
    if (req.file) {
      profilePic = `/uploads/${req.file.filename}`;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNumber: rollNumber || null }] 
    });

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
      rollNumber: role === 'student' ? rollNumber : undefined,
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
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

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