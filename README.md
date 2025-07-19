# 🚀 EventPass – College Event Manager

![Dashboard Screenshot](Frontend/public/dashboard-screenshot.png)

---

## 🎯 What is EventPass?

EventPass is a modern web app for managing college events. Students can register for events, get QR passes, and admins can manage everything from a beautiful dashboard.

---

## ✨ Features

- 🔐 **Secure Login & Registration** for students and admins
- 🖼️ **Profile Management** (upload your photo, edit details)
- 🗓️ **Event Management** (create, edit, delete events with posters)
- 🎟️ **QR Passes** for instant event entry
- 📱 **QR Code Scanning** for real-time attendance
- 📊 **Admin Dashboard** (see all events, registrations, export CSV)
- 🌗 **Light & Dark Mode**
- 💾 **Persistent Login** (remembers you)

---

## 🛠️ Tech Stack

- **Frontend:**
  - ⚛️ React (Vite)
  - 🎨 Tailwind CSS
  - 🧭 React Router
  - 🖼️ Lucide Icons
  - 📷 html5-qrcode (QR scanning)
  - 🔥 React Hot Toast (notifications)
  - 🔗 Axios (API requests)

- **Backend:**
  - 🏃 Express.js
  - 🍃 MongoDB (Mongoose)
  - 🖼️ Multer (file uploads)
  - 🔑 JWT (auth)
  - 📦 QRCode (QR generation)
  - 📄 json2csv (CSV export)

---

## 📦 Key Packages

- `html5-qrcode` – In-browser QR code scanning
- `multer` – Image uploads
- `qrcode` – QR code generation
- `json2csv` – CSV export for admins

---

## 📁 Project Structure

```
college/
  backend/
    models/
    routes/
    middleware/
    uploads/
    server.js
  Frontend/
    src/
      components/
      pages/
      context/
    public/
      dashboard-screenshot.png
  README.md
```

---

## 🖼️ Screenshots

### Admin Dashboard
![Admin Dashboard](Frontend/public/admindashboard.png)

### User Dashboard
![User Dashboard](Frontend/public/userdashboard.png)

---

## ⚡ Quick Start

### 1️⃣ Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 2️⃣ Installation

```bash
# Clone the repo
$ git clone https://github.com/yourusername/eventpass.git
$ cd eventpass

# Backend setup
$ cd backend
$ npm install
$ cp .env.example .env  # Add your MongoDB URI and JWT secret
$ npm start

# Frontend setup
$ cd ../Frontend
$ npm install
$ npm run dev
```

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Environment Variables

**Backend (.env):**
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## 👩‍💻 Usage

- **Students:** Register, log in, view/register for events, download QR passes.
- **Admins:** Log in, create/edit/delete events, view registrations, scan QR codes, export data.

---

## 🧭 How It Works

1. **Register/Login** – Students and admins sign up and upload a profile picture.
2. **Create Events** – Admins add events with details and posters.
3. **Register for Events** – Students register and get a unique QR code.
4. **Scan QR at Entry** – Admins scan QR codes to mark attendance and see user details instantly.
5. **Profile Management** – Users can update their info and photo anytime.

---

## 🤖 AI Prompt for Screenshot

> "Create a beautiful dashboard UI for a college event management app. The design should feature a modern dark mode, a sticky navbar with a logo and user profile, event stats cards, and a section showing event passes with QR codes. Use gradients, rounded cards, and clean typography."

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you want to change.

---

## 📄 License

[MIT](LICENSE)

---

**Questions?**  
Open an issue or contact the maintainer.

---

> _Built with Express, React, MongoDB, html5-qrcode, and lots of love for seamless college event management!_ 
