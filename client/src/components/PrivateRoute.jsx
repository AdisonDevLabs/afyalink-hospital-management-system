// frontend/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn('PrivateRoute: Not authenticated. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  // If authenticated but user object not fully loaded or role not available yet
  if (!user || !user.role) {
    console.warn('PrivateRoute: Authenticated, but user object or role not yet available. Waiting for user data...');
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading user profile...</div>
      </div>
    );
  }

  // Check if the user's role is allowed for this protected section
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: User role '${user.role}' not allowed for this route. Redirecting to dashboard.`);
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard or a specific "access denied" page
  }

  // If authenticated and authorized, render the nested route
  return <Outlet />;
};

export default PrivateRoute;