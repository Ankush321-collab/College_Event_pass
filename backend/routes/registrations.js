import express from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { authenticateToken } from '../middleware/auth.js';
import { Parser as Json2csvParser } from 'json2csv';

const router = express.Router();

// Register for event
router.post('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.currentRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      studentId,
      eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create QR code data
    const qrPayload = {
      studentId: studentId.toString(),
      eventId: eventId.toString(),
      timestamp: Date.now()
    };

    const qrCodeData = jwt.sign(qrPayload, process.env.JWT_SECRET);

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Create registration
    const registration = new Registration({
      studentId,
      eventId,
      qrCodeData
    });

    await registration.save();

    // Update event registration count
    event.currentRegistrations += 1;
    await event.save();

    // Populate registration data
    await registration.populate([
      { path: 'studentId', select: 'name email rollNumber' },
      { path: 'eventId', select: 'title date venue' }
    ]);

    res.status(201).json({
      message: 'Registration successful',
      registration,
      qrCodeImage
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get user's registrations
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate('eventId', 'title date venue posterUrl')
      .sort({ createdAt: -1 });

    // Generate QR codes for each registration
    const registrationsWithQR = await Promise.all(
      registrations.map(async (reg) => {
        const qrCodeImage = await QRCode.toDataURL(reg.qrCodeData);
        return {
          ...reg.toObject(),
          qrCodeImage
        };
      })
    );

    res.json(registrationsWithQR);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event registrations (Admin only)
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('studentId', 'name email rollNumber profilePic')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export event registrations as CSV (Admin only)
router.get('/export/:eventId', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('studentId', 'name email rollNumber')
      .sort({ createdAt: -1 });

    if (!registrations.length) {
      return res.status(404).json({ message: 'No registrations found for this event' });
    }

    const data = registrations.map(reg => ({
      Name: reg.studentId?.name || '-',
      Email: reg.studentId?.email || '-',
      RollNumber: reg.studentId?.rollNumber || '-',
      RegisteredAt: reg.createdAt,
      Status: reg.isScanned ? 'Scanned' : 'Pending'
    }));

    const json2csv = new Json2csvParser({ fields: ['Name', 'Email', 'RollNumber', 'RegisteredAt', 'Status'] });
    const csv = json2csv.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ message: 'Server error during export' });
  }
});

export default router;