// frontend/src/components/Navbar.jsx

import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';
import { motion } from 'framer-motion';

import {
  LayoutDashboard, Users, HeartPulse, Calendar, ClipboardList, Building2, ChevronLeft
} from 'lucide-react';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Receive toggleSidebar prop
function Navbar({ isSidebarExpanded, toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const navRef = useRef(null);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/users", label: "Users", icon: Users, roles: ["admin"] },
    { to: "/patients", label: "Patients", icon: HeartPulse, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/clinical-notes", label: "Clinical Notes", icon: ClipboardList, roles: ["admin", "doctor", "nurse"] },
    { to: "/departments", label: "Departments", icon: Building2, roles: ["admin"] },
    { to: "/schedules", label: "Schedules", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] }, // Added Schedules link
  ];

  return (
    <>
      <nav
        ref={navRef}
        // ⭐ UPDATED: Added hidden md:flex to control visibility on small screens
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl z-20 transition-all duration-300 ease-in-out
          ${isSidebarExpanded ? 'w-48' : 'w-18'} flex flex-col hidden md:flex`}
      >
        <div className="flex-shrink-0 py-2 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center justify-center">
            <img src={afyalinkLogo} alt="AfyaLink Logo" className={`h-20 transition-all duration-300 ${isSidebarExpanded ? 'w-auto' : 'w-12'}`} />
          </Link>
        </div>

        <div className="flex-grow mt-6 px-2">
          <div className="space-y-2">
            {user && navLinks.map((link) => {
              // Only render if the user's role is allowed for this link
              const isActive = location.pathname === link.to;
              return link.roles.includes(user.role) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-x-3 px-3 py-2 rounded-md text-base font-medium w-full
                    transition-colors duration-300
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 hover:text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                    }
                    ${isSidebarExpanded ? 'justify-start' : 'justify-center'}
                  `}
                >
                  {link.icon && <link.icon size={25} />}
                  {isSidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Toggle Button (Desktop) */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={toggleSidebar} // Use the prop directly
            className={`w-full flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-300
              ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft className={`h-6 w-6 transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;