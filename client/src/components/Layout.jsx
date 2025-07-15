// frontend/src/components/Layout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';

// Import Lucide Icons for mobile menu
import { X, Menu, LayoutDashboard, Users, HeartPulse, Calendar, ClipboardList, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';

// Helper function to capitalize the first letter of a string
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  // State for desktop sidebar expansion
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  // State for mobile menu overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation links for mobile menu as well
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/users", label: "Users", icon: Users, roles: ["admin"] },
    { to: "/patients", label: "Patients", icon: HeartPulse, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/clinical-notes", label: "Clinical Notes", icon: ClipboardList, roles: ["admin", "doctor", "nurse"] },
    { to: "/departments", label: "Departments", icon: Building2, roles: ["admin"] },
    { to: "/schedules", label: "Schedules", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] }, // Added Schedules link
  ];

  // Set initial sidebar state based on screen size and handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setIsSidebarExpanded(false); // Collapse desktop sidebar on small screens
        // Do NOT set isMobileMenuOpen here, it should be controlled by the button
      } else {
        setIsSidebarExpanded(true); // Expand desktop sidebar on large screens
        setIsMobileMenuOpen(false); // Ensure mobile menu is closed if resizing to larger screen
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);


  // Unified toggle function for both desktop sidebar and mobile menu
  const toggleUnifiedMenu = () => {
    if (window.innerWidth < 768) { // If on small screen, toggle mobile menu
      setIsMobileMenuOpen(prev => !prev);
    } else { // If on large screen, toggle desktop sidebar
      setIsSidebarExpanded(prev => !prev);
    }
  };

  // Adjust main content margin based on sidebar state, only applies on md and larger screens
  const mainContentMarginClass = isSidebarExpanded ? 'md:ml-48' : 'md:ml-18'; // Adjusted w-48 and w-20 to match Navbar

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Desktop Sidebar - visible on md and larger, controlled by isSidebarExpanded */}
      <div className="hidden md:block">
        <Navbar isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleUnifiedMenu} />
      </div>

      {/* Main content area */}
      <div className={`flex flex-col flex-grow overflow-y-auto ${mainContentMarginClass} transition-all duration-300`}>
        <Header toggleSidebar={toggleUnifiedMenu} />

        <main className="flex-grow"> {/* Added padding for content */}
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }} // Start off-screen to the right
            animate={{ x: 0 }}      // Slide in to 0
            exit={{ x: '100%' }}    // Slide out to the right
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 w-full h-full bg-white z-50 flex flex-col p-4 shadow-lg md:hidden" // Ensure it's hidden on md+
          >
            {/* Close Button for Mobile Menu */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Close Navigation"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* Mobile Nav Links */}
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
                        ? 'bg-blue-100 text-blue-700 hover:text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                  >
                    {link.icon && <link.icon size={20} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Info and Logout for Mobile */}
            {user && (
              <div className="mt-auto pt-4 border-t border-gray-200">
                <span className="text-gray-600 font-medium text-sm block mb-2">
                  Hello, {user.first_name || user.username} ({capitalize(user.role)})
                </span>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false); // Close menu after logout
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