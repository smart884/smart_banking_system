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
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

/**
 * Simple Protected Route
 * Checks if a user is logged in and has the correct role.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { userProfile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!userProfile) return <Navigate to="/login" replace />;
  
  if (roles && !roles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Dashboard Redirector
 * Redirects users to their specific dashboard based on role.
 */
const DashboardRedirect = () => {
  const { userProfile } = useAuth();
  
  if (!userProfile) return <Navigate to="/login" replace />;
  
  switch (userProfile.role) {
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'manager': return <Navigate to="/manager/dashboard" replace />;
    case 'clerk': return <Navigate to="/clerk/dashboard" replace />;
    default: return <Navigate to="/user/dashboard" replace />;
  }
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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <SecureDashboard />
          </ProtectedRoute>
        } />

        <Route path="/clerk/*" element={
          <ProtectedRoute roles={['clerk']}>
            <ClerkDashboard />
          </ProtectedRoute>
        } />

        <Route path="/manager/*" element={
          <ProtectedRoute roles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Status Page */}
        <Route path="/pending-approval" element={
          <ProtectedRoute>
            <PendingStatus />
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/clerk-dashboard" element={<Navigate to="/clerk/dashboard" replace />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
