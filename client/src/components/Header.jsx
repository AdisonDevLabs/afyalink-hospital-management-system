import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import afyalinkLogo from '../assets/afyalink-logo.svg';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const backendUrl = import.meta.env.VITE_API_URL;
const apiBackendUrl = backendUrl.replace('/api', '');

function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user && user.profile_picture) {
    const finalImageUrl = user.profile_picture.startsWith('/uploads/')
      ? `${apiBackendUrl}${user.profile_picture}`
      : user.profile_picture;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white h-20 dark:bg-gray-900 text-white p-4 shadow-lg fixed top-0 left-0 w-full z-30 flex items-center justify-between pr-2 lg:pl-2 md:pl-4 shadow-md dark:shadow-lg px-2 py-4">
      <button
        onClick={toggleSidebar}
        className="pl-2 text-gray-500 cursor-pointer hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 block md:hidden"
        aria-label="Toggle Navigation"
      >
        <Menu className="h-8 w-8" />
      </button>

      <div className="flex-grow ml-">
        <Link to="/dashboard" className="flex items-center">
          <img src={afyalinkLogo} alt="AfyaLink Logo" className="h-20 mt-2 w-auto hidden md:block" />
        </Link>
      </div>

      <div className='flex items-center space-x-4'>
        <ThemeToggle />
        {user && (
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture.startsWith('/uploads/')
                       ? `${apiBackendUrl}${user.profile_picture}`
                       : user.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : '')}
                </span>
              )}
            </div>

            <span className="text-gray-600 font-medium text-sm hidden md:block dark:text-gray-400">
              Hello, {user.first_name || user.username} ({capitalize(user.role)})
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm flex items-center gap-x-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;