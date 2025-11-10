import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Navbar receives navLinks as a prop from DashboardLayout
function Navbar({ isSidebarExpanded, toggleSidebar, navLinks }) { 
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);

  return (
    <motion.nav
      ref={navRef}
      initial={{ width: isSidebarExpanded ? 192 : 64 }}
      animate={{ width: isSidebarExpanded ? 192 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col pt-4 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300`}
    >{/*
      <div className={`p-4 flex items-center mb-6 overflow-hidden ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}>
        <img
          src='/assets/afyalink-logo2.svg'
          alt="AfyaLink Logo"
          className={`transition-all duration-200 ${isSidebarExpanded ? 'w-8 h-8 mr-2' : 'w-8 h-8'}`}
        />
        {isSidebarExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap"
          >
            AfyaLink
          </motion.span>
        )}
      </div>*/}

      <div className="flex-grow mt-20 overflow-y-auto overflow-x-hidden p-2">
        <div className="space-y-1">
          {user && navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return link.roles.includes(user.role) && (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center h-10 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isSidebarExpanded ? 'px-3 gap-x-3' : 'px-0'}
                  ${isActive
                    ? 'bg-orange-500 text-white shadow-md dark:bg-orange-500'
                    : 'text-black hover:bg-orange-500 hover:text-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-white'
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

      <div className="flex-shrink-0 p-4 border-t border-orange-500 mt-auto dark:border-orange-500">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center justify-center py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300
            ${isSidebarExpanded ? 'justify-end' : 'justify-center'} dark:text-orange-500 dark:hover:bg-orange-600`}
          aria-label="Toggle Sidebar"
        >
          <ChevronLeft className={`h-6 w-6 transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'} dark:text-white`} />
        </button>
      </div>
    </motion.nav>
  );
}

export default Navbar;