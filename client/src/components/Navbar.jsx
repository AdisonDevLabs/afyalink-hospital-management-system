import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, HeartPulse, Calendar, User, ClipboardList, Building2, ChevronLeft
} from 'lucide-react';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Navbar({ isSidebarExpanded, toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);

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

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-[80px] left-0 bottom-0 bg-white shadow-xl z-20 bg-green-600 transition-all duration-400 ease-in-out
          ${isSidebarExpanded ? 'w-48' : 'w-18'} flex flex-col hidden md:flex
          dark:bg-gray-900 dark:shadow-none dark:border-r dark:border-gray-700`}
      >
        <div className="flex-grow mt-6 px-2">
          <div className="space-y-2">
            {user && navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return link.roles.includes(user.role) && (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-x-3 px-3 py-2 rounded-md text-base font-medium w-full
                    transition-colors duration-300
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 hover:text-blue-800 dark:bg-blue-700 dark:text-white dark:hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400'
                    }
                    ${isSidebarExpanded ? 'justify-start' : 'justify-center'}
                  `}
                >
                  {link.icon && <link.icon size={25} className="dark:text-gray-200" />}
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

        <div className="flex-shrink-0 p-4 border-t border-gray-200 mt-auto dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-300
              ${isSidebarExpanded ? 'justify-end' : 'justify-center'} dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400`}
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft className={`h-6 w-6 transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'} dark:text-gray-300`} />
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
