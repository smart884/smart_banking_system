import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './SecureAuthContext';

const SecureProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Requirements: Redirect to dashboard after login (from here)
    return <Navigate to="/secure-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default SecureProtectedRoute;
