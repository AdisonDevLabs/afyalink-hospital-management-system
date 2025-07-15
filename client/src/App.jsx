import { useState } from 'react'
import viteLogo from '/vite.svg'
import React, { useEffect, lazy, Suspense } from 'react'; // Add lazy, Suspense
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import { useAuth } from './context/AuthContext';


import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// A simple Not Found component to display for unmatched routes
const NotFound = () => (
  <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800'>
    <h1 className='text-6xl font-bold text-red-600'>404</h1>
    <p className='text-2xl mt-4'>Page Not Found</p>
    <p className='text-lg mt-2'>The page you are looking for does not exist.</p>
    <a href="/dashboard" className='mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300'>
      Go to Dashboard
    </a>
  </div>
);

// --- Lazily load your page components ---
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const DoctorDashboardPage = lazy(() => import('./pages/DoctorDashboardPage'));
const ReceptionistDashboardPage = lazy(() => import('./pages/ReceptionistDashboardPage'));
const NurseDashboardPage = lazy(() => import('./pages/NurseDashboardPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ClinicalNotesPage = lazy(() => import('./pages/ClinicalNotesPage'));
const UsersManagementPage = lazy(() => import('./pages/UsersManagementPage'));
const DepartmentsManagementPage = lazy(() => import('./pages/DepartmentsManagementPage'));
//const HomePage = lazy(() => import('./pages/HomePage'));
const HomePagePublic = lazy(() => import('./pages/HomePagePublic'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ScheduleManagementPage = lazy(() => import('./pages/ScheduleManagementPage'));

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/register', '/unauthorized', '/home'];

        if (publicPaths.includes(currentPath) || currentPath === '/dashboard') {
          switch (user.role) {
            case 'admin':
              navigate('/dashboard/admin', { replace: true });
              break;
            case 'doctor':
              navigate('/dashboard/doctor', { replace: true });
              break;
            case 'receptionist':
              navigate('/dashboard/receptionist', { replace: true });
              break;
            case 'nurse':
              navigate('/dashboard/nurse', { replace: true });
              break;
            default:
              navigate('/unauthorized', { replace: true });
              break;
          }
        }
      } else if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/unauthorized', '/home', '/'];

        if (!publicPaths.includes(currentPath)) {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [loading, isAuthenticated, user, navigate]);


  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      {/*
        Wrap your Routes with Suspense.
        The fallback will be shown while the code for a lazy-loaded component is being fetched.
      */}
      <Suspense fallback={
        <div className='flex justify-center items-center h-screen bg-gray-100'>
          <div className='text-xl text-gray-700'>Loading content...</div>
        </div>
      }>
        <Routes>
          {/* Public routes 
          <Route path="/" element={<HomePage />} />*/}
          <Route path="/" element={<HomePagePublic />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<div className="flex justify-center items-center h-screen bg-red-50"><div className="text-lg text-red-700">Access Denied: You do not have permission to view this page.</div></div>} />

          {/* Authenticated routes wrapped with Layout and PrivateRoute */}
          <Route element={<Layout />}>
            {/* Generic dashboard route - will redirect to specific dashboard based on user role */}
            <Route path="/dashboard" element={
              isAuthenticated && user ? (
                user.role === 'admin' ? <Navigate to="/dashboard/admin" replace /> :
                user.role === 'doctor' ? <Navigate to="/dashboard/doctor" replace /> :
                user.role === 'receptionist' ? <Navigate to="/dashboard/receptionist" replace /> :
                user.role === 'nurse' ? <Navigate to="/dashboard/nurse" replace /> :
                <Navigate to="/unauthorized" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />

            {/* Role-Specific Dashboard Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
              <Route path="/dashboard/doctor" element={<DoctorDashboardPage />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['receptionist']} />}>
              <Route path="/dashboard/receptionist" element={<ReceptionistDashboardPage />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['nurse']} />}>
              <Route path="/dashboard/nurse" element={<NurseDashboardPage />} />
            </Route>

            {/* General Protected Routes (accessible by multiple roles) */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}/>}>
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/clinical-notes" element={<ClinicalNotesPage />} />
              <Route path="/clinical-notes/:patientId" element={<ClinicalNotesPage />} />
              <Route path="/schedules" element={<ScheduleManagementPage />} />
            </Route>

            {/* Admin Specific Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
                <Route path="/users" element={<UsersManagementPage />} />
                <Route path="/departments" element={<DepartmentsManagementPage />} />
            </Route>
          </Route>

          {/* Fallback for unknown routes */}
          <Route
            path="*"
            element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}


function App() {
  return (
    <AppContent />
  );
}

export default App;
