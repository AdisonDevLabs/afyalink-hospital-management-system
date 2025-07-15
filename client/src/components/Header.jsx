// frontend/src/components/Header.jsx

import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Helper function to capitalize the first letter of a string
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Header({ toggleSidebar }) { // Receive toggleSidebar prop
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center h-20 pt-12 pb-12 px-2 bg-white shadow-md md:pl-4 lg:pl-20">
      {/* Sidebar/Mobile Menu Toggle Button */}
      {/* This button will be visible on small screens (block) and hidden on medium+ screens (md:hidden) */}
      <button
        onClick={toggleSidebar} // Use the prop directly
        className="pl-2 text-gray-500 cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 block"
        aria-label="Toggle Navigation"
      >
        <Menu className="h-8 w-8" />
      </button>

      {/* Placeholder for Search Bar / Brand Name */}
      <div className="flex-grow ml-3">
        {/* The Dashboard title will be hidden on small screens and shown on medium+ */}
        <span className="font-semibold text-lg text-gray-800 hidden md:block">Dashboard</span>
      </div>

      {/* User Profile and Logout Section */}
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 font-medium text-sm hidden md:block">
            Hello, {user.first_name || user.username} ({capitalize(user.role)})
          </span>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm flex items-center gap-x-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span> {/* Hide text on very small screens */}
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;