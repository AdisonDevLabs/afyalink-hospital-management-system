import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes, allowedDashboardRoles } from './routes';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';
import PrivateRoute from '../components/PrivateRoute';

// Redirect component to user’s specific dashboard
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const LoginPage = lazy(() => import('../features/auth/pages/LoginPage')); 

  const LoadingFallback = (
  <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-black">
    <div className="relative mb-6">
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-24 h-24 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin-slow blur-sm"></div>
      </div>

      <img
        src="/assets/afyalink-logo2.svg"
        alt="AfyaLink Logo"
        className="w-16 h-16 relative z-10 drop-shadow-lg animate-pulse"
      />
    </div>

    <p className="text-lg font-medium text-black dark:text-white tracking-wide animate-pulse">
      Loading <span className="text-orange-500 dark:text-orange-500">AfyaLink...</span>
    </p>
  </div>
);

  return (
      <Suspense fallback={LoadingFallback}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {publicRoutes
            .filter(r => r.path !== '/login')
            .map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}

          {/* --- LOGIN --- */}
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <DashboardRedirect />
                : <LoginPage />
            }
          />


            {/* Index Route for / - Redirects authenticated users */}
            {isAuthenticated && (
              <Route path="/" element={<DashboardRedirect />} />
            )}
            

          {/* --- PROTECTED LAYOUT WRAPPER FOR ALL FEATURES --- */}
          <Route 
            element={
              <PrivateRoute allowedRoles={allowedDashboardRoles}>
                <Layout />
              </PrivateRoute>
            }
          >

            {/* INDIVIDUAL PROTECTED ROUTES */}
            {protectedRoutes.map(({ path, element: Element, roles }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <PrivateRoute allowedRoles={roles}>
                            <Element />
                        </PrivateRoute>
                    }
                />
            ))}
          </Route>

          {/* --- FALLBACK ROUTE --- */}
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
  );
}

export default AppRouter;