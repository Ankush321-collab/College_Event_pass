# EventPass – College Event Manager

![Dashboard Screenshot](./Frontend/public/dashboard-screenshot.png)

## Overview

**EventPass** is a full-stack web application for managing college events, registrations, and attendance using QR codes. It provides a seamless experience for both students and administrators, allowing for easy event creation, registration, QR pass generation, and real-time attendance tracking.

---

## Features

- **User Authentication:** Secure login and registration for students and admins.
- **Profile Management:** Users can upload a profile picture, view, and edit their details.
- **Event Management:** Admins can create, edit, and delete events with poster uploads.
- **Student Dashboard:** Students can view upcoming, attended, and registered events, and download QR passes.
- **QR Code Attendance:** Admins can scan QR codes to mark attendance, with instant user detail popups.
- **Admin Dashboard:** View all events, registrations, export CSV, and see registered students with profile images.
- **Responsive UI:** Modern, mobile-friendly design with light/dark mode toggle.
- **Persistent Sessions:** User data and tokens are stored securely for persistent login.

---

## Tech Stack

- **Frontend:**  
  - React.js (Vite)
  - Tailwind CSS (with custom themes)
  - React Router
  - Lucide React Icons
  - html5-qrcode (for QR scanning)
  - Axios (API requests)
  - React Hot Toast (notifications)

- **Backend:**  
  - Express.js
  - MongoDB (Mongoose)
  - Multer (file uploads)
  - JWT (authentication)
  - QRCode (QR code generation)
  - json2csv (CSV export)

---

## Key Packages

- **html5-qrcode:** Enables in-browser QR code scanning for attendance.
- **Multer:** Handles image uploads for event posters and user profile pictures.
- **QRCode:** Generates QR codes for event passes.
- **json2csv:** Exports registration data as CSV for admins.

---

## Project Structure

```
college/
  backend/
    models/
    routes/
    middleware/
    uploads/
    server.js
    ...
  Frontend/
    src/
      components/
      pages/
      context/
      ...
    public/
      dashboard-screenshot.png
    ...
  README.md
```

---

## Screenshots

### Student Dashboard

![Student Dashboard](./Frontend/public/dashboard-screenshot.png)

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eventpass.git
cd eventpass
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create a .env file with your MongoDB URI and JWT secret
cp .env.example .env
npm start
```

- The backend runs on `http://localhost:5000` by default.

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
npm run dev
```

- The frontend runs on `http://localhost:5173` by default.

---

## Environment Variables

**Backend (.env):**
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Usage

- **Students:** Register, log in, view events, register for events, and download QR passes.
- **Admins:** Log in, create/edit/delete events, view registrations, scan QR codes for attendance, and export data.

---

## How It Works

- **Registration:** Students register and upload a profile picture.
- **Event Creation:** Admins create events with details and poster images.
- **QR Pass Generation:** Upon registration, students receive a unique QR code for each event.
- **Attendance:** Admins scan QR codes at the event entrance; the system verifies and marks attendance, showing user details in a modal.
- **Profile Management:** Users can update their profile and picture at any time.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

**Questions?**  
Open an issue or contact the maintainer.

---

> _This project was built with Express, React, MongoDB, html5-qrcode, and lots of love for seamless college event management!_

---

**Tip:**  
Replace `./Frontend/public/dashboard-screenshot.png` with the actual path to your dashboard screenshot, or upload your screenshot to the `public` folder and update the path accordingly. 