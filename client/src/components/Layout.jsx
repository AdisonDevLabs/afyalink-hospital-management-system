import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';

import { X, User, Menu, LayoutDashboard, Users, HeartPulse, Calendar, ClipboardList, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "nurse", "guest_demo"] },
    { to: "/users", label: "Users", icon: Users, roles: ["admin", "guest_demo"] },
    { to: "/patients", label: "Patients", icon: HeartPulse, roles: ["admin", "doctor", "receptionist", "nurse", "guest_demo"] },
    { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse", "guest_demo"] },
    { to: "/clinical-notes", label: "Clinical Notes", icon: ClipboardList, roles: ["admin", "doctor", "nurse", "guest_demo"] },
    { to: "/departments", label: "Departments", icon: Building2, roles: ["admin", "guest_demo"] },
    { to: "/schedules", label: "Schedules", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse", "guest_demo"] },
    { to: "/profile", label: "My Profile", icon: User, roles: ["admin", "doctor", "receptionist", "nurse", "guest_demo"] },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleUnifiedMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarExpanded(prev => !prev);
    }
  };

  const mainContentMarginClass = isSidebarExpanded ? 'md:ml-48' : 'md:ml-16';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800">

      <div className="hidden md:block">
        <Navbar isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleUnifiedMenu} />
      </div>

      <div className={`flex flex-col flex-grow overflow-y-auto ${mainContentMarginClass} transition-all duration-200`}>
        <Header toggleSidebar={toggleUnifiedMenu} />

        <main className="flex-grow py-0.4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-md mt-[80px]">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 w-full h-full bg-white z-50 flex flex-col p-4 shadow-lg md:hidden dark:bg-gray-900"
          >
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close Navigation"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="flex flex-col space-y-2 flex-grow">
              {user && navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return link.roles.includes(user.role) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`
                      flex items-center gap-x-3 px-4 py-3 rounded-lg text-base font-medium
                      transition-colors duration-300
                      ${isActive
                        ? 'bg-blue-100 text-blue-700 hover:text-blue-800 dark:bg-blue-700 dark:text-white dark:hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon && <link.icon size={20} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 font-medium text-sm block mb-2 dark:text-gray-300">
                  Hello, {user.first_name || user.username} ({capitalize(user.role)})
                </span>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm flex items-center gap-x-2 w-full justify-center"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Layout;
