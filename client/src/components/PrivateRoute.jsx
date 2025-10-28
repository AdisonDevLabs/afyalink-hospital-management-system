import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isDemoMode) {
    console.warn('PrivateRoute: Not authenticated. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = isDemoMode ? 'guest_demo' : user?.role;

  if (!effectiveRole) {
    console.warn('PrivateRoute: Authenticated, but effective role is missing. Waiting or denying access.');
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900'>
        <div className='text-xl text-gray-700 dark:text-gray-200'>
          Loading user profile...
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    console.warn(`Access Denied: User role '${effectiveRole}' not allowed for this route. Redirecting to dashboard.`);
    console.log('allowedRoles:', allowedRoles, 'effectiveRole:', effectiveRole);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
