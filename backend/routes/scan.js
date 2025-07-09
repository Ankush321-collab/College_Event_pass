import express from 'express';
import jwt from 'jsonwebtoken';
import Registration from '../models/Registration.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Scan QR code
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { qrCodeData } = req.body;

    // Verify QR code data
    let decodedData;
    try {
      decodedData = jwt.verify(qrCodeData, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }

    // Find registration
    const registration = await Registration.findOne({
      studentId: decodedData.studentId,
      eventId: decodedData.eventId,
      qrCodeData
    }).populate([
      { path: 'studentId', select: 'name email rollNumber' },
      { path: 'eventId', select: 'title date venue' }
    ]);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if already scanned
    if (registration.isScanned) {
      return res.status(400).json({ 
        message: 'QR code already used',
        scannedAt: registration.scannedAt,
        registration
      });
    }

    // Mark as scanned
    registration.isScanned = true;
    registration.scannedAt = new Date();
    registration.scannedBy = req.user._id;
    await registration.save();

    res.json({
      message: 'Entry verified successfully',
      registration
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Server error during QR scan' });
  }
});

export default router;