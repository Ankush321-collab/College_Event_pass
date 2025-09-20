import express from 'express';
import Event from '../models/Event.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from './registrations.js';

const router = express.Router();

// Multer setup with memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/jpg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp, bmp, svg).'));
    }
  }
});

// Image upload endpoint
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'college_event_pass/events',
      resource_type: 'auto'
    });

    res.status(201).json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, venue, capacity, posterUrl } = req.body;

    const event = new Event({
      title,
      description,
      date,
      venue,
      capacity,
      posterUrl,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    // Notify all student users about the new event
    const students = await User.find({ role: 'student' });
    const notifications = students.map(student => ({
      user: student._id,
      message: `New event: ${title} on ${new Date(date).toLocaleString()} at ${venue}`,
      type: 'new_event',
      eventId: event._id,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

    // Send emails to all students about the new event asynchronously
    setTimeout(() => {
      students.forEach(async (student) => {
        if (student.email) {
          try {
            const eventDate = new Date(date);
            const htmlContent = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #222;">👋 Hello <span style=\"color: #007bff;\">${student.name}</span>,</h2>
      <p style="font-size: 16px; margin-top: 20px;">
        <strong>A new event has been added to your dashboard!</strong>
      </p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f0f4ff; border-left: 4px solid #007bff; border-radius: 5px;">
        <p style="margin: 0;"><strong>📌 Event:</strong> ${title}</p>
        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate.toLocaleString()}</p>
        <p style="margin: 0;"><strong>📍 Venue:</strong> ${venue}</p>
      </div>
      <p style="font-size: 16px;">
        👉 <a href=\"https://your-eventpass-link.com\" style=\"color: #ffffff; background-color: #007bff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;\">Login to EventPass</a> to view more details and register.
      </p>
      <p style="margin-top: 30px; font-size: 14px; color: #777;">
        Thank you,<br/>
        <strong>EventPass Team</strong>
      </p>
    </div>
  </body>
</html>`;
            await sendEmail({
              to: student.email,
              subject: `🎉 New Event Added: ${title}`,
              text: `Hello ${student.name},\nA new event has been added: ${title}\nDate: ${eventDate.toLocaleString()}\nVenue: ${venue}\nLogin to EventPass for more details and to register!`,
              html: htmlContent,
            });
            console.log(`Email sent to ${student.email} for event: ${title}`);
          } catch (err) {
            console.error(`Failed to send email to ${student.email}:`, err);
          }
        }
      });
    }, 0);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (Admin only)
// Helper function to extract Cloudinary public_id from URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const matches = url.match(/college_event_pass\/events\/[^/]+/);
  return matches ? matches[0] : null;
};

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, venue, capacity, posterUrl } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, venue, capacity, posterUrl },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete image from Cloudinary if it exists
    if (event.posterUrl) {
      const publicId = getPublicIdFromUrl(event.posterUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Mark related notifications as deleted
    await Notification.updateMany({ eventId: event._id }, { $set: { deleted: true } });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;