import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const DoctorDashboardPage = lazy(() => import('./pages/DoctorDashboardPage'));
const NurseDashboardPage = lazy(() => import('./pages/NurseDashboardPage'));
const ReceptionistDashboardPage = lazy(() => import('./pages/ReceptionistDashboardPage'));
const GuestDashboardPage = lazy(() => import('./pages/GuestDashboardPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ClinicalNotesPage = lazy(() => import('./pages/ClinicalNotesPage'));
const ScheduleManagementPage = lazy(() => import('./pages/ScheduleManagementPage'));
const UsersManagementPage = lazy(() => import('./pages/UsersManagementPage'));
const DepartmentsManagementPage = lazy(() => import('./pages/DepartmentsManagementPage'));
const UserProfilePage = lazy(() => import('./components/UserProfile'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePagePublic = lazy(() => import('./pages/HomePagePublic'));

// Redirect component that sends users to their role-specific dashboard
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <LoginPage />
            }
          />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route element={<PrivateRoute allowedRoles={['admin','doctor','nurse','receptionist','guest']} />}>
              {/* Dashboard with role-based index redirect */}
              <Route path="dashboard">
                <Route index element={<DashboardRedirect />} />

                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route path="admin" element={<AdminDashboardPage />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
                  <Route path="doctor" element={<DoctorDashboardPage />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={['receptionist']} />}>
                  <Route path="receptionist" element={<ReceptionistDashboardPage />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={['nurse']} />}>
                  <Route path="nurse" element={<NurseDashboardPage />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={['guest']} />}>
                  <Route path="guest" element={<GuestDashboardPage />} />
                </Route>
              </Route>

              {/* Shared Pages */}
              <Route path="patients" element={<PatientsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="clinical-notes" element={<ClinicalNotesPage />} />
              <Route path="clinical-notes/:patientId" element={<ClinicalNotesPage />} />
              <Route path="schedules" element={<ScheduleManagementPage />} />
              <Route path="profile" element={<UserProfilePage />} />

              {/* Admin & Guest-only */}
              <Route element={<PrivateRoute allowedRoles={['admin','guest']} />}>
                <Route path="users" element={<UsersManagementPage />} />
                <Route path="departments" element={<DepartmentsManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              isAuthenticated
                ? <DashboardRedirect />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default AppContent;
