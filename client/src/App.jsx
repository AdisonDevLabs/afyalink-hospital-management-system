import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboardPage'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboardPage'));
const NurseDashboard = lazy(() => import('./pages/NurseDashboardPage'));
const ReceptionistDashboard = lazy(() => import('./pages/ReceptionistDashboardPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ClinicalNotesPage = lazy(() => import('./pages/ClinicalNotesPage'));
const ScheduleManagementPage = lazy(() => import('./pages/ScheduleManagementPage'));
const UsersManagementPage = lazy(() => import('./pages/UsersManagementPage'));
const DepartmentsManagementPage = lazy(() => import('./pages/DepartmentsManagementPage'));
const UserProfilePage = lazy(() => import('./components/UserProfile'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePagePublic = lazy(() => import('./pages/HomePagePublic'));

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }
  const role = user?.role;

  if (role === 'doctor') {
    return <DoctorDashboard />
  }
  if (role === 'nurse') {
    return <NurseDashboard />
  }
  if (role === 'receptionist') {
    return <ReceptionistDashboard />
  }
  return <AdminDashboard />

}

function AppContent() {
  const { isAuthenticated, isDemoMode } = useAuth(); 
  const navigate = useNavigate();

  // Redirect logged-in users away from login page to the base dashboard path.
  useEffect(() => {
    if ((isAuthenticated || isDemoMode) && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isDemoMode, navigate]);

  const dashboardRedirect = (
    <Navigate to="/dashboard" replace />
  );

  return (
    <div className="App">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="text-xl">Loading...</div>
          </div>
        }
      >
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<HomePagePublic />} />
          <Route
            path="/login"
            element={
              (isAuthenticated || isDemoMode)
                ? <Navigate to="/dashboard" replace />
                : <LoginPage />
            }
          />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            {/* The main PrivateRoute wrapper */}
            <Route element={<PrivateRoute allowedRoles={['admin','doctor','nurse','receptionist','guest_demo']} />}>
              
              {/* --- UNIFIED DASHBOARD ROUTE --- */}
              {/* All users (including demo) with any role should land here */}
              <Route path="dashboard" element={<DashboardRouter />} />

              {/* Shared Pages - All authorized roles have access to these */}
              <Route path="patients" element={<PatientsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="clinical-notes" element={<ClinicalNotesPage />} />
              <Route path="clinical-notes/:patientId" element={<ClinicalNotesPage />} />
              <Route path="schedules" element={<ScheduleManagementPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              
              {/* Admin & Guest-only (still protected by PrivateRoute) */}
              <Route element={<PrivateRoute allowedRoles={['admin', 'guest_demo']} />}>
                <Route path="users" element={<UsersManagementPage />} />
                <Route path="departments" element={<DepartmentsManagementPage />} />
              </Route>
              
            </Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              (isAuthenticated || isDemoMode)
                ? dashboardRedirect
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default AppContent;