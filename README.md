# College Event QR Pass Generator

A full-stack MERN application for managing college events with QR-based entry passes.

## Features

### Student Features
- Register and login with roll number
- View upcoming events
- Register for events and get QR passes
- Download QR passes
- View registration history

### Admin Features
- Create and manage events
- View event analytics
- Scan QR codes for entry verification
- View attendee lists

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **QR Code**: qrcode + html5-qrcode

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd college-event-qr-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URL=mongodb://localhost:27017/college-events
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Usage

### For Students
1. Register with your name, email, roll number, and password
2. Browse available events
3. Register for events to get QR passes
4. Download QR passes from your dashboard
5. Show QR code at event entry

### For Admins
1. Register with admin role
2. Create events with details like title, date, venue, capacity
3. Use QR scanner to verify student entries
4. View event analytics and attendee lists

## Project Structure

```
college-event-qr-system/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── App.jsx
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Registrations
- `POST /api/registrations/:eventId` - Register for event
- `GET /api/registrations/my-registrations` - Get user registrations
- `GET /api/registrations/event/:eventId` - Get event registrations (admin)

### QR Scanning
- `POST /api/scan` - Scan and verify QR code (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the Ankush Kumar Adhikari
.
