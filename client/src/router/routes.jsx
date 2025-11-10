import { lazy } from "react";

// Public Pages
const HomePagePublic = lazy(() => import('../pages/HomePagePublic'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const UserProfileComponent = lazy(() => import('../components/UserProfile')); 


// Dashboard Pages (Feature Pages)
const AdminDashboardPage = lazy(() => import('../features/dashboards/pages/AdminDashboardPage'));
const DoctorDashboardPage = lazy(() => import('../features/dashboards/pages/DoctorDashboardPage'));
const NurseDashboardPage = lazy(() => import('../features/dashboards/pages/NurseDashboardPage')); 
const ReceptionistDashboardPage = lazy(() => import('../features/dashboards/pages/ReceptionistDashboardPage'));
const GuestDashboardPage = lazy(() => import('../features/dashboards/pages/GuestDashboardPage'));

// Core/Shared Pages
const PatientsPage = lazy(() => import('../pages/PatientsPage'));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage'));
const ClinicalNotesPage = lazy(() => import('../pages/ClinicalNotesPage'));
const ScheduleManagementPage = lazy(() => import('../pages/ScheduleManagementPage'));

// Admin/System Management Pages
const UsersManagementPage = lazy(() => import('../pages/UsersManagementPage'));
const DepartmentsManagementPage = lazy(() => import('../pages/DepartmentsManagementPage'));


// --- Route Configuration Array ---

export const publicRoutes = [
  { path: '/', element: HomePagePublic, name: 'Home' },
  { path: '/login', element: LoginPage, name: 'Login' },
  { path: '/register', element: RegisterPage, name: 'Register' },
];

export const protectedRoutes = [
  // Dashboard Routes
  { path: '/dashboard/admin', element: AdminDashboardPage, roles: ['admin'] },
  { path: '/dashboard/doctor', element: DoctorDashboardPage, roles: ['doctor'] },
  { path: '/dashboard/nurse', element: NurseDashboardPage, roles: ['nurse'] },
  { path: '/dashboard/receptionist', element: ReceptionistDashboardPage, roles: ['receptionist'] },
  { path: '/dashboard/guest', element: GuestDashboardPage, roles: ['guest'] },

  // Shared/Core Feature Routes
  { path: '/patients', element: PatientsPage, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { path: '/appointments', element: AppointmentsPage, roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/clinical-notes', element: ClinicalNotesPage, roles: ['admin', 'doctor', 'nurse'] },
  { path: '/clinical-notes/:patientId', element: ClinicalNotesPage, roles: ['admin', 'doctor', 'nurse'] },
  { path: '/schedules', element: ScheduleManagementPage, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { path: '/profile', element: UserProfileComponent, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'guest'] },

  // Admin/System Routes
  { path: '/users', element: UsersManagementPage, roles: ['admin', 'guest'] },
  { path: '/departments', element: DepartmentsManagementPage, roles: ['admin', 'guest'] },
];

// Combine all roles for the base dashboard path to enable the DashboardRedirect
export const allowedDashboardRoles = protectedRoutes
    .filter(route => route.path.startsWith('/dashboard/'))
    .flatMap(route => route.roles);