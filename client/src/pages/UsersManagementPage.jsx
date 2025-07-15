// frontend/src/pages/UsersManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ) : (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${iconColor} focus:ring-2 focus:ring-opacity-50`}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </motion.div>
  );
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "-100vh" }}
        animate={{ y: "0" }}
        exit={{ y: "100vh" }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-700 mb-6">Are you sure you want to delete the user "<span className="font-semibold">{userName}</span>"? This action cannot be undone.</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

// --- Main UsersManagementPage Component ---
function UsersManagementPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });

  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Holds user data if editing
  const [userToDelete, setUserToDelete] = useState(null); // Holds user data if confirming delete
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '', // For new user registration
    role: 'receptionist', // Changed default role from 'patient' to 'receptionist'
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    gender: '',
    specialization: '', // Added for doctors
  });

  // Base URL for API calls
  //const backendUrl = '/api/';

  const fetchUsers = useCallback(async () => {
    if (!token) return; // Ensure token is available

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      if (filterRole) {
        queryParams.append('role', filterRole);
      }

      const response = await fetch(`${backendUrl}/api/users?${queryParams.toString()}`, { // Added query parameters
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) { // Forbidden
          setError('You do not have permission to view users.');
          navigate('/unauthorized'); // Redirect if not authorized
        }
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users.');
      setNotification({ message: 'Failed to load users. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, filterRole, backendUrl, navigate]); // Dependencies for useCallback

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role === 'admin') {
      fetchUsers();
    } else if (!authLoading && (!isAuthenticated || user.role !== 'admin')) {
      navigate('/unauthorized'); // Redirect if not authenticated or not admin
    }
  }, [authLoading, isAuthenticated, user, navigate, fetchUsers]);

  // Handle search and filter changes with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(); // Re-fetch users when search term or filter role changes
    }, 300); // Debounce for 300ms
    return () => clearTimeout(handler);
  }, [searchTerm, filterRole, fetchUsers]);


  // Helper for user initials/avatar
  const getUserAvatar = (user) => {
    if (user.photo_url) {
      return <img src={user.photo_url} alt={user.first_name} className="h-8 w-8 rounded-full object-cover mr-3" />;
    }
    const initials = `${user.first_name ? user.first_name[0] : ''}${user.last_name ? user.last_name[0] : ''}`.toUpperCase();
    // Simple hash for color based on the first initial
    const charCode = initials.charCodeAt(0) || 0; // Get ASCII value, default to 0 if no initials
    const hue = (charCode * 10) % 360; // Spread hues across the color spectrum
    const bgColor = `hsl(${hue}, 70%, 90%)`; // Light background
    const textColor = `hsl(${hue}, 70%, 30%)`; // Darker text
    return (
      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0`} style={{ backgroundColor: bgColor, color: textColor }}>
        {initials || '?'}
      </div>
    );
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${backendUrl}/api/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle user status.');
      }
      setNotification({ message: 'User status updated successfully!', type: 'success' });
      fetchUsers(); // Re-fetch to ensure data consistency
    } catch (err) {
      console.error('Error toggling user status:', err);
      setNotification({ message: err.message || 'Failed to toggle user status.', type: 'error' });
    }
  };

  const handleResetPassword = async (userId) => {
    if (!token) {
      setNotification({ message: 'Authentication required. Please log in.', type: 'error' });
      return;
    }
    setNotification({ message: `Sending password reset for user ${userId}...`, type: 'info' });
    try {
      const response = await fetch(`${backendUrl}/api/users/${userId}/reset-password`, {
        method: 'POST', // Changed to POST, as reset usually triggers an action, not updates a resource directly
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send password reset.');
      }
      setNotification({ message: 'Password reset link sent successfully!', type: 'success' });
    } catch (err) {
      console.error('Error sending password reset:', err);
      setNotification({ message: err.message || 'Failed to send password reset.', type: 'error' });
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetFormData = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'receptionist', // Default role after reset
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      date_of_birth: '',
      gender: '',
      specialization: '',
    });
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    resetFormData();
    setNotification({ message: null, type: null }); // Clear previous notifications
    setShowUserFormModal(true);
  };

  const handleEditUserClick = (userToEdit) => {
    setEditingUser(userToEdit);
    setNotification({ message: null, type: null }); // Clear previous notifications
    // Populate form with existing user data, but not password
    setFormData({
      username: userToEdit.username,
      password: '', // Password is not editable directly
      confirmPassword: '',
      role: userToEdit.role,
      first_name: userToEdit.first_name || '',
      last_name: userToEdit.last_name || '',
      email: userToEdit.email || '',
      phone_number: userToEdit.phone_number || '',
      address: userToEdit.address || '',
      date_of_birth: userToEdit.date_of_birth ? new Date(userToEdit.date_of_birth).toISOString().split('T')[0] : '',
      gender: userToEdit.gender || '',
      specialization: userToEdit.specialization || '',
    });
    setShowUserFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setNotification({ message: 'Authentication required. Please log in.', type: 'error' });
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    // Basic validation for doctor specialization
    if (formData.role === 'doctor' && !formData.specialization) {
      setNotification({ message: 'Specialization is required for doctors.', type: 'error' });
      return;
    }

    // Remove confirmPassword as it's not sent to the backend
    const { confirmPassword, ...dataToSend } = formData;

    // Remove password if editing and password field is empty (meaning no change)
    if (editingUser && dataToSend.password === '') {
      delete dataToSend.password;
    }

    let url = `${backendUrl}/api/users`;
    let method = 'POST';

    if (editingUser) {
      url = `${backendUrl}/api/users/${editingUser.id}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed.');
      }

      setNotification({ message: `User ${editingUser ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowUserFormModal(false);
      setEditingUser(null);
      resetFormData();
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error(`Error ${editingUser ? 'updating' : 'adding'} user:`, err);
      setNotification({ message: `Error ${editingUser ? 'updating' : 'adding'} user: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !token) return;

    try {
      const response = await fetch(`${backendUrl}/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user.');
      }

      setNotification({ message: 'User deleted successfully!', type: 'success' });
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification({ message: `Error deleting user: ${err.message}`, type: 'error' });
    }
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-gray-700">Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <div className="text-lg text-red-700">Unauthorized Access. Only administrators can view this page.</div>
      </div>
    );
  }

  // Pagination logic (if needed for larger datasets, currently not fully implemented with API pagination)
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <motion.div
      className="container mx-auto p-6 bg-gray-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: null, type: null })}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        {user && ['admin'].includes(user.role) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddUserClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Add New User</span>
          </motion.button>
        )}
      </div>

      {/* Filter and Search Section */}
      <motion.div
        className="bg-white shadow-lg rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name/Username:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700">Filter by Role:</label>
          <select
            id="filterRole"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="nurse">Nurse</option>
            {/* Add other roles as needed */}
          </select>
        </div>
        {/* Potentially add more filters here */}
      </motion.div>


      <motion.div
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        variants={itemVariants}
      >
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading users...</p>
        ) : error ? (
          <p className="p-6 text-center text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Full Name</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Last Login</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentUsers.map((u) => (
                    <motion.tr
                      key={u.id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 flex items-center">
                        {getUserAvatar(u)}
                        {u.username}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900">{`${u.first_name || ''} ${u.last_name || ''}`}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 capitalize">{u.role}</td>
                      <td className="px-5 py-4 text-sm text-gray-900">{u.email}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditUserClick(u)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit User"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z"></path>
                            </svg>
                          </motion.button>
                          {user && user.id !== u.id && ( // Prevent admin from deleting themselves
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteClick(u)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete User"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleToggleStatus(u.id, u.is_active)}
                                className={`text-sm py-1 px-2 rounded ${u.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                title={u.is_active ? "Deactivate User" : "Activate User"}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleResetPassword(u.id)}
                                className="text-purple-600 hover:text-purple-800 text-sm py-1 px-2 rounded bg-purple-100 hover:bg-purple-200"
                                title="Reset Password"
                              >
                                Reset Pass
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination Controls (Placeholder - adjust based on actual API pagination) */}
      {users.length > usersPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                  ${currentPage === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } rounded-md`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}


      {/* User Add/Edit Modal */}
      <Modal
        isOpen={showUserFormModal}
        onClose={() => { setShowUserFormModal(false); setEditingUser(null); resetFormData(); setNotification({ message: null, type: null }); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='username'>Username</label>
            <input
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
              required
              disabled={!!editingUser} // Username should not be editable when editing
            />
          </div>

          {!editingUser && ( // Only show password fields for new user creation
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='password'>Password</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
                  required={!editingUser}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='confirmPassword'>Confirm Password</label>
                <input
                  type='password'
                  id='confirmPassword'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
                  required={!editingUser}
                />
              </div>
            </>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='role'>Role</label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
              required
            >
              <option value='admin'>Admin</option>
              <option value='doctor'>Doctor</option>
              {/* Removed <option value='patient'>Patient</option> */}
              <option value='receptionist'>Receptionist</option>
              <option value='nurse'>Nurse</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='first_name'>First Name</label>
            <input
              type='text'
              id='first_name'
              name='first_name'
              value={formData.first_name}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='last_name'>Last Name</label>
            <input
              type='text'
              id='last_name'
              name='last_name'
              value={formData.last_name}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='phone_number'>Phone Number</label>
            <input
              type='text'
              id='phone_number'
              name='phone_number'
              value={formData.phone_number}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='address'>Address</label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='date_of_birth'>Date of Birth</label>
            <input
              type='date'
              id='date_of_birth'
              name='date_of_birth'
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='gender'>Gender</label>
            <select
              id='gender'
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          {formData.role === 'doctor' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='specialization'>Specialization</label>
              <input
                type='text'
                id='specialization'
                name='specialization'
                value={formData.specialization}
                onChange={handleInputChange}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800'
                required={formData.role === 'doctor'}
              />
            </div>
          )}

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => { setShowUserFormModal(false); setEditingUser(null); resetFormData(); setNotification({ message: null, type: null }); }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        userName={userToDelete ? userToDelete.username : ''}
      />
    </motion.div>
  );
}

export default UsersManagementPage;