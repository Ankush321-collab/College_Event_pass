import cron from 'node-cron';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// Function to update event status based on date
const updateEventStatuses = async () => {
  const now = new Date();
  
  try {
    // Update upcoming events to ongoing
    await Event.updateMany(
      { 
        date: { $lte: now },
        status: 'upcoming'
      },
      { 
        $set: { status: 'ongoing' }
      }
    );

    // Mark events as completed and set deletion date (7 days after event)
    const eventsToComplete = await Event.find({
      date: { $lt: now },
      status: 'ongoing'
    });

    for (const event of eventsToComplete) {
      event.status = 'completed';
      event.scheduledForDeletion = new Date(event.date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after event
      await event.save();
    }

    // Delete events that are past their scheduled deletion date
    const eventsToDelete = await Event.find({
      scheduledForDeletion: { $lt: now }
    });

    for (const event of eventsToDelete) {
      // Delete associated registrations
      await Registration.deleteMany({ eventId: event._id });
      // Delete the event
      await Event.findByIdAndDelete(event._id);
    }
  } catch (error) {
    console.error('Error in event cleanup service:', error);
  }
};

// Schedule the cleanup to run every day at midnight
const scheduleCleanup = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running event cleanup service...');
    await updateEventStatuses();
  });
};

// Function to manually trigger cleanup (for testing)
const runCleanup = async () => {
  await updateEventStatuses();
};

export { scheduleCleanup, runCleanup };