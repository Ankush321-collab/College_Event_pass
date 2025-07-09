import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import QRScanner from './pages/QRScanner';
import CreateEvent from './pages/CreateEvent';
import AdminEventDetails from './pages/AdminEventDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] dark:bg-gradient-to-br dark:from-[#0f2027] dark:via-[#2c5364] dark:to-[#232526] text-gray-900 dark:text-cyan-100 transition-colors duration-300">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              {/* Protected Student Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/create-event" 
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/event/:eventId" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminEventDetails />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/admin/scan" 
                element={
                  <ProtectedRoute adminOnly>
                    <QRScanner />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;