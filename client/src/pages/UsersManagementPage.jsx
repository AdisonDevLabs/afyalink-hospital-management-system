// frontend/src/pages/UsersManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants for common Tailwind CSS classes ---
const INPUT_CLASSES = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 transition-colors duration-300';
const BUTTON_BASE_CLASSES = 'font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300';
const BUTTON_GREEN_CLASSES = `bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white ${BUTTON_BASE_CLASSES}`;
const BUTTON_BLUE_CLASSES = `bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white ${BUTTON_BASE_CLASSES}`;
const BUTTON_GRAY_CLASSES = `bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 ${BUTTON_BASE_CLASSES}`;

// --- Reusable FormField Component ---
const FormField = ({ label, id, name, type = 'text', value, onChange, required = false, disabled = false, children }) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300 transition-colors duration-300'>
      {label}
    </label>
    {type === 'select' ? (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={INPUT_CLASSES.replace('focus:border-blue-500', 'focus:border-transparent transition duration-200 ease-in-out')}
        required={required}
        disabled={disabled}
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={INPUT_CLASSES}
        required={required}
        disabled={disabled}
      />
    )}
  </div>
);

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const colorMap = {
    success: {
      bg: 'bg-green-100 dark:bg-green-800',
      border: 'border-green-400 dark:border-green-600',
      text: 'text-green-700 dark:text-green-100',
      icon: 'text-green-500 dark:text-green-300',
      focus: 'focus:ring-green-500'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-800',
      border: 'border-red-400 dark:border-red-600',
      text: 'text-red-700 dark:text-red-100',
      icon: 'text-red-500 dark:text-red-300',
      focus: 'focus:ring-red-500'
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-800', // Added for info type
      border: 'border-blue-400 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-100',
      icon: 'text-blue-500 dark:text-blue-300',
      focus: 'focus:ring-blue-500'
    }
  };

  const colors = colorMap[type] || colorMap.info; // Default to info if type is not recognized

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3
                  ${colors.bg} ${colors.border} ${colors.text} border-l-4 transition-colors duration-300`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className={`h-6 w-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ) : (
        <svg className={`h-6 w-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${colors.icon} ${colors.focus} focus:ring-2 focus:ring-opacity-50
                  hover:bg-opacity-80 dark:hover:bg-opacity-70 transition-colors duration-300`}
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
      className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50 p-4 transition-colors duration-300"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "-100vh" }}
        animate={{ y: "0" }}
        exit={{ y: "100vh" }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl p-6 w-full max-w-2xl relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-300"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">{title}</h2>
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
      <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">Are you sure you want to delete the user "<span className="font-semibold text-gray-900 dark:text-gray-50">{userName}</span>"? This action cannot be undone.</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className={BUTTON_GRAY_CLASSES}>Cancel</button>
        <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">Delete</button>
      </div>
    </Modal>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// --- Main UsersManagementPage Component ---
function UsersManagementPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });

  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const initialFormData = {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'receptionist',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    gender: '',
    specialization: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetFormData = () => setFormData(initialFormData);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterRole) queryParams.append('role', filterRole);

      const response = await fetch(`${backendUrl}/api/v1/users?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) navigate('/unauthorized');
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
  }, [token, searchTerm, filterRole, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'admin') { // Simplified user role check
      fetchUsers();
    } else if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/unauthorized');
    }
  }, [authLoading, isAuthenticated, user, navigate, fetchUsers]);

  useEffect(() => {
    const handler = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, filterRole, fetchUsers]);

  const getUserAvatar = (u) => {
    if (u.photo_url) return <img src={u.photo_url} alt={u.first_name} className="h-8 w-8 rounded-full object-cover mr-3" />;
    const initials = `${u.first_name ? u.first_name[0] : ''}${u.last_name ? u.last_name[0] : ''}`.toUpperCase();
    const charCode = initials.charCodeAt(0) || 0;
    const hue = (charCode * 10) % 360;
    const bgColor = `hsl(${hue}, 70%, 90%)`;
    const textColor = `hsl(${hue}, 70%, 30%)`;
    return (
      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm mr-3 flex-shrink-0`} style={{ backgroundColor: bgColor, color: textColor }}>
        {initials || '?'}
      </div>
    );
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!token) { setNotification({ message: 'Authentication required.', type: 'error' }); return; }
    try {
      const response = await fetch(`${backendUrl}/api/v1/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle user status.');
      }
      setNotification({ message: 'User status updated successfully!', type: 'success' });
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setNotification({ message: err.message || 'Failed to toggle user status.', type: 'error' });
    }
  };

  const handleResetPassword = async (userId) => {
    if (!token) { setNotification({ message: 'Authentication required.', type: 'error' }); return; }
    setNotification({ message: `Sending password reset for user ${userId}...`, type: 'info' });
    try {
      const response = await fetch(`${backendUrl}/api/v1/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const openUserFormModal = (userToEdit = null) => {
    setEditingUser(userToEdit);
    resetFormData();
    if (userToEdit) {
      setFormData({
        ...initialFormData, // Start with all fields from initial
        username: userToEdit.username,
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
    }
    setNotification({ message: null, type: null });
    setShowUserFormModal(true);
  };

  const closeUserFormModal = () => {
    setShowUserFormModal(false);
    setEditingUser(null);
    resetFormData();
    setNotification({ message: null, type: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) { setNotification({ message: 'Authentication required.', type: 'error' }); return; }
    if (!editingUser && formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Passwords do not match.', type: 'error' }); return;
    }
    if (formData.role === 'doctor' && !formData.specialization) {
      setNotification({ message: 'Specialization is required for doctors.', type: 'error' }); return;
    }

    const { confirmPassword, ...dataToSend } = formData;
    if (editingUser && dataToSend.password === '') delete dataToSend.password;

    const url = editingUser ? `${backendUrl}/api/v1/users/${editingUser.id}` : `${backendUrl}/api/v1/users`;
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed.');
      }

      setNotification({ message: `User ${editingUser ? 'updated' : 'added'} successfully!`, type: 'success' });
      closeUserFormModal();
      fetchUsers();
    } catch (err) {
      console.error(`Error ${editingUser ? 'updating' : 'adding'} user:`, err);
      setNotification({ message: `Error ${editingUser ? 'updating' : 'adding'} user: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteClick = (user) => setUserToDelete(user);

  const confirmDelete = async () => {
    if (!userToDelete || !token) return;

    try {
      const response = await fetch(`${backendUrl}/api/v1/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
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

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (authLoading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-lg text-gray-700 dark:text-gray-300">Loading authentication...</div>;
  if (!isAuthenticated || user?.role !== 'admin') return <div className="flex justify-center items-center h-screen bg-red-50 dark:bg-red-900 transition-colors duration-300 text-lg text-red-700 dark:text-red-100">Unauthorized Access. Only administrators can view this page.</div>;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <motion.div
      className="container mx-auto p-6 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300"
      variants={containerVariants} initial="hidden" animate="visible"
    >
      <AnimatePresence>{notification.message && <Notification {...notification} onClose={() => setNotification({ message: null, type: null })} />}</AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">User Management</h1>
        {user?.role === 'admin' && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openUserFormModal()} className={`${BUTTON_BLUE_CLASSES} flex items-center space-x-2`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add New User</span>
          </motion.button>
        )}
      </div>

      <motion.div className="bg-white shadow-lg rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 dark:bg-gray-800 dark:shadow-xl transition-colors duration-300" variants={itemVariants}>
        <FormField label="Search by Name/Username:" id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users..." />
        <FormField label="Filter by Role:" id="filterRole" name="filterRole" type="select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="receptionist">Receptionist</option>
          <option value="nurse">Nurse</option>
        </FormField>
      </motion.div>

      <motion.div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-xl transition-colors duration-300" variants={itemVariants}>
        {loading ? (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">Loading users...</p>
        ) : error ? (
          <p className="p-6 text-center text-red-500 dark:text-red-400">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors duration-300">
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
                    <motion.tr key={u.id} className="hover:bg-gray-50 border-b border-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors duration-300" variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-300">{getUserAvatar(u)}{u.username}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{`${u.first_name || ''} ${u.last_name || ''}`}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 capitalize transition-colors duration-300">{u.role}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">{u.email}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'} transition-colors duration-300`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center space-x-3">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openUserFormModal(u)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-300" title="Edit User">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z"></path></svg>
                          </motion.button>
                          {user && user.id !== u.id && (
                            <>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteClick(u)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-300" title="Delete User">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggleStatus(u.id, u.is_active)}
                                className={`text-sm py-1 px-2 rounded ${u.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100 dark:hover:bg-yellow-600' : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600'} transition-colors duration-300`}
                                title={u.is_active ? "Deactivate User" : "Activate User"}>
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleResetPassword(u.id)}
                                className="text-purple-600 hover:text-purple-800 text-sm py-1 px-2 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-700 dark:text-purple-100 dark:hover:bg-purple-600 transition-colors duration-300"
                                title="Reset Password">
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-300
                  ${currentPage === i + 1 ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-700 dark:border-blue-700 dark:text-gray-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      <Modal isOpen={showUserFormModal} onClose={closeUserFormModal} title={editingUser ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField label='Username' id='username' name='username' value={formData.username} onChange={handleInputChange} required disabled={!!editingUser} />
          {!editingUser && (
            <>
              <FormField label='Password' id='password' name='password' type='password' value={formData.password} onChange={handleInputChange} required={!editingUser} />
              <FormField label='Confirm Password' id='confirmPassword' name='confirmPassword' type='password' value={formData.confirmPassword} onChange={handleInputChange} required={!editingUser} />
            </>
          )}
          <FormField label='Role' id='role' name='role' type='select' value={formData.role} onChange={handleInputChange} required>
            <option value='admin'>Admin</option>
            <option value='doctor'>Doctor</option>
            <option value='receptionist'>Receptionist</option>
            <option value='nurse'>Nurse</option>
            <option value='guest'>Guest</option>
          </FormField>
          <FormField label='First Name' id='first_name' name='first_name' value={formData.first_name} onChange={handleInputChange} />
          <FormField label='Last Name' id='last_name' name='last_name' value={formData.last_name} onChange={handleInputChange} />
          <FormField label='Email' id='email' name='email' type='email' value={formData.email} onChange={handleInputChange} required />
          <FormField label='Phone Number' id='phone_number' name='phone_number' value={formData.phone_number} onChange={handleInputChange} />
          <FormField label='Address' id='address' name='address' value={formData.address} onChange={handleInputChange} className='md:col-span-2' />
          <FormField label='Date of Birth' id='date_of_birth' name='date_of_birth' type='date' value={formData.date_of_birth} onChange={handleInputChange} />
          <FormField label='Gender' id='gender' name='gender' type='select' value={formData.gender} onChange={handleInputChange}>
            <option value=''>Select Gender</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Other'>Other</option>
          </FormField>
          {formData.role === 'doctor' && (
            <FormField label='Specialization' id='specialization' name='specialization' value={formData.specialization} onChange={handleInputChange} required={formData.role === 'doctor'} />
          )}

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button type='button' onClick={closeUserFormModal} className={BUTTON_GRAY_CLASSES}>Cancel</button>
            <button type='submit' className={BUTTON_GREEN_CLASSES}>{editingUser ? 'Update User' : 'Add User'}</button>
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