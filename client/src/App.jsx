import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
// Import our placeholder pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import History from './pages/History';
import Cycle from './pages/Cycle';
import Plan from './pages/Plan';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';

// The Security Bouncer Component
// It checks if the user has a token. If they do, it lets them see the page (children).
// If they don't, it forcefully redirects them to the login screen!
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If they are logged in, we render the Navbar at the very top, and then the actual page content below it!
  return (
    <>
      <Navbar />
      <main className="page-content">
        {children}
      </main>
    </>
  );
}

export default function App() {
  return (
    // 0. Wrap the app in ThemeProvider to support light/dark mode
    <ThemeProvider>
      {/* 1. Wrap the entire app in the AuthProvider dome so everything can access the user data */}
      <AuthProvider>
        {/* 2. Wrap the app in the Router so we can have multiple pages (URLs) */}
        <BrowserRouter>
          <Routes>
            {/* Public Routes (Anyone can visit these) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (You must be logged in to visit these) */}
            {/* Notice how the real page is passed in as the 'children' of the ProtectedRoute! */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/log" element={<ProtectedRoute><Log /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/cycle" element={<ProtectedRoute><Cycle /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

            {/* Catch-All Route: If they type a random URL like /apple, send them back to the dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
