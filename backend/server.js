import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import scanRoutes from './routes/scan.js';
import path from 'path';
import cron from 'node-cron';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import User from './models/User.js';
import nodemailer from 'nodemailer';
import { scheduleCleanup, runCleanup } from './services/eventCleanup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/scan', scanRoutes);

// Utility function to send email (copied from registrations.js)
async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

// Cron job: runs every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Find events happening in ~24 hours
    const events = await Event.find({
      date: { $gte: new Date(in24h.getTime() - 30 * 60 * 1000), $lte: new Date(in24h.getTime() + 30 * 60 * 1000) }
    });
    for (const event of events) {
      // Find all registrations for this event
      const registrations = await Registration.find({ eventId: event._id }).populate('studentId');
      for (const reg of registrations) {
        if (reg.studentId && reg.studentId.email) {
          await sendEmail({
            to: reg.studentId.email,
            subject: `Reminder: Upcoming Event - ${event.title}`,
            text: `Dear ${reg.studentId.name},\n\nThis is a reminder for the event: ${event.title} on ${event.date}.\nVenue: ${event.venue}\n\nSee you there!`,
          });
        }
      }
    }
    if (events.length > 0) {
      console.log(`Reminders sent for events: ${events.map(e => e.title).join(', ')}`);
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('🚀 Connected to MongoDB');
    // Initialize event cleanup service
    scheduleCleanup();
    // Run initial cleanup
    runCleanup();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

  app.use('/',(req,res)=>{
    res.send("backend running by ankush")
  })
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});