import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/SecureAuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import OTPLogin from './pages/OTPLogin';
import Registration from './pages/Registration';
import ApplyCreditCard from './pages/ApplyCreditCard';
import ApplyDebitCard from './pages/ApplyDebitCard';
import ApplyPersonalLoan from './pages/ApplyPersonalLoan';
import ApplyKYC from './pages/ApplyKYC';
import PendingStatus from './pages/PendingStatus';
import SecureDashboard from './pages/SecureDashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Payments from './pages/Payments';
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium tracking-tight">Verifying Secure Session...</p>
        </div>
      </div>
    );
  }
  
  if (!userProfile) return <Navigate to="/login" replace />;
  
  const userRole = userProfile.role?.toLowerCase();
  const allowedRoles = roles?.map(r => r.toLowerCase());
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
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
  
  const role = userProfile.role?.toLowerCase();
  
  switch (role) {
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
        <Route path="/login-otp" element={<OTPLogin />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Credit Card Application */}
        <Route path="/apply-credit-card" element={
          <ProtectedRoute roles={['customer']}>
            <ApplyCreditCard />
          </ProtectedRoute>
        } />
        <Route path="/apply-debit-card" element={
          <ProtectedRoute roles={['customer']}>
            <ApplyDebitCard />
          </ProtectedRoute>
        } />
        <Route path="/apply-personal-loan" element={
          <ProtectedRoute roles={['customer']}>
            <ApplyPersonalLoan />
          </ProtectedRoute>
        } />
        <Route path="/apply-kyc" element={
          <ProtectedRoute roles={['customer']}>
            <ApplyKYC />
          </ProtectedRoute>
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <SecureDashboard />
          </ProtectedRoute>
        } />

        <Route path="/transactions" element={
          <ProtectedRoute roles={['customer']}>
            <Transactions />
          </ProtectedRoute>
        } />

        <Route path="/accounts" element={
          <ProtectedRoute roles={['customer']}>
            <Accounts />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute roles={['customer']}>
            <Payments />
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
