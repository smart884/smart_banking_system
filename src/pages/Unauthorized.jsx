import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <ShieldOff className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You do not have the necessary permissions to view this page.
        </p>
        <div className="mt-6">
          <Link 
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
