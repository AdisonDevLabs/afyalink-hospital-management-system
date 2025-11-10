
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles, children }) => {
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

  if (!user || !user.role) {
    console.warn('PrivateRoute: Authenticated, but user object or role not yet available. Waiting for user data...');
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading user profile...</div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: User role '${user.role}' not allowed for this route. Redirecting to dashboard.`);
    console.log('allowedRoles:', allowedRoles, 'user.role:', user.role);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
