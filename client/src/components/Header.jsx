import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
    <header className="bg-white dark:bg-gray-900 text-white h-20 fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
      <button
        onClick={toggleSidebar}
        className="text-orange-500 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 md:hidden"
        aria-label="Toggle Navigation"
      >
        <Menu className="h-7 w-7" />
      </button>

      <div className="flex-1 flex justify-center md:justify-start">
        <Link to="/dashboard" className="flex items-center">
          <div className="relative h-16 w-16">
            <img
              src='/assets/afyalink-logo2.svg'
              alt="AfyaLink Logo Light"
              className="absolute inset-0 h-full w-auto md:block dark:hidden animate-fade-in"
            />
            <img
              src='/assets/afyalink-logo.svg'
              alt='AfyaLink Logo Dark'
              className="absolute inset-0 h-full w-auto hidden dark:md:block animate-fade-in" />
          </div>
        </Link>
      </div>

      <div className='flex items-center space-x-4'>
        <ThemeToggle />
        {user && (
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture.startsWith('/uploads/')
                       ? `${apiBackendUrl}${user.profile_picture}`
                       : user.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-black dark:text-white text-lg font-semibold">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : '')}
                </span>
              )}
            </div>

            <span className="text-black font-medium text-sm hidden md:block dark:text-white">
              Hello, {user.first_name || user.username} [{capitalize(user.role)}]
            </span>
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm flex items-center gap-x-2"
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