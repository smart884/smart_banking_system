import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/SecureAuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Registration from './pages/Registration';
import PendingStatus from './pages/PendingStatus';
import SecureDashboard from './pages/SecureDashboard';
import ClerkDashboard from './pages/ClerkDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

/**
 * Simple Protected Route
 * Just checks if a user is logged in (static).
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile } = useAuth();
  if (!userProfile) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected Dashboard Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute>
            <SecureDashboard />
          </ProtectedRoute>
        } />

        <Route path="/clerk/*" element={
          <ProtectedRoute>
            <ClerkDashboard />
          </ProtectedRoute>
        } />

        <Route path="/manager/*" element={
          <ProtectedRoute>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Status Page */}
        <Route path="/pending-approval" element={
          <ProtectedRoute>
            <PendingStatus />
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/clerk-dashboard" element={<Navigate to="/clerk/dashboard" replace />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
