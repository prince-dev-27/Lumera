import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-red-50 border border-red-200 text-center">
        <h2 className="text-xl font-serif text-red-700 font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-red-600 mb-6">
          You do not have administrative privileges to view this page. (Admin Role Required)
        </p>
        <a
          href="/profile"
          className="inline-block bg-luxury-charcoal text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-luxury-gold transition"
        >
          Return to Profile
        </a>
      </div>
    );
  }

  return children;
}
