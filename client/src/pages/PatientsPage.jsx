// frontend/src/pages/PatientsPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" } },
};

// --- Reusable Notification Component (no change, as it's already optimized) ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';
  const iconColor = type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg dark:shadow-none flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className={`absolute top-1 right-1 ${iconColor} hover:text-gray-900 dark:hover:text-gray-100`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// --- Simple Modal Component (no change, as it's already optimized) ---
const Modal = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-none w-full max-w-2xl transform sm:my-8 sm:align-middle sm:w-full"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-md p-1 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Delete Confirmation Modal (no change, as it's already optimized) ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, patientName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="text-center p-5">
        <svg className="mx-auto mb-4 h-16 w-16 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        <h3 className="mb-5 text-lg font-normal text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the record for <span className="font-semibold">{patientName}</span>?
          This action cannot be undone.
        </h3>
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            Yes, I'm sure
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            No, cancel
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

// --- Extracted Form Components for Reusability ---
const FormInput = ({ label, id, type = 'text', value, onChange, placeholder, required = false, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className='block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300'>
      {label} {required && <span className="text-red-500">*</span>}:
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${className}`}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  </div>
);

const FormSelect = ({ label, id, value, onChange, options, required = false, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className='block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300'>
      {label} {required && <span className="text-red-500">*</span>}:
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${className}`}
      required={required}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const FormTextArea = ({ label, id, value, onChange, placeholder, rows = '3', className = '', ...props }) => (
  <div>
    <label htmlFor={id} className='block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300'>
      {label}:
    </label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${className}`}
      placeholder={placeholder}
      {...props}
    ></textarea>
  </div>
);


const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PatientsPage() {
  const { token, isAuthenticated, user, loading: authLoading, getApiPrefix } = useAuth();
  const navigate = useNavigate();
  const isDemoUser = user?.role === 'guest_demo';

  const [patients, setPatients] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [modalState, setModalState] = useState({
    showPatientForm: false,
    showDeleteConfirm: false,
    patientToDelete: null,
    editingPatient: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: '',
    national_id: '', contact_phone: '', email: '', address: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    emergency_contact_relationship: '', allergies: '', conditions: '',
    photo_id_file: null, photo_id_url: ''
  });
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  }, []);

  const fetchPatients = useCallback(async () => {
    setPageLoading(true);
    setNotification({ message: null, type: null });

    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch patients.');
      }
      const data = await response.json();

      if (data && Array.isArray(data.patients)) {
        setPatients(data.patients);
      } else {
        console.error('API response for patients is not an array or malformed:', data);
        throw new Error('Received invalid data format from server.');
      }

    } catch (err) {
      console.error('Error fetching patients:', err);
      showNotification(err.message || 'Failed to load patients.', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    fetchPatients();
  }, [isAuthenticated, token, authLoading, navigate, fetchPatients]);

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      setPhotoPreviewUrl(file ? URL.createObjectURL(file) : '');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetFormData = useCallback(() => {
    setFormData({
      first_name: '', last_name: '', date_of_birth: '', gender: '',
      national_id: '', contact_phone: '', email: '', address: '',
      emergency_contact_name: '', emergency_contact_phone: '',
      emergency_contact_relationship: '', allergies: '', conditions: '',
      photo_id_file: null, photo_id_url: ''
    });
    setPhotoPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });
    if (isDemoUser) {
      const isEditing = !!modalState.editingPatient;
      showNotification(`Action blocked: Patient ${isEditing ? 'update' : 'creation'} is disabled in Demo Mode.`, 'error');
    }

    const { first_name, last_name, date_of_birth, gender, contact_phone } = formData;
    if (!first_name || !last_name || !date_of_birth || !gender || !contact_phone) {
      setNotification({ message: 'Please fill in all required fields: First Name, Last Name, Date of Birth, Gender, Contact Phone.', type: 'error' });
      return;
    }

    const isEditing = !!modalState.editingPatient;
    const url = isEditing ? `${backendUrl}${getApiPrefix()}/patients/${modalState.editingPatient.id}` : `${backendUrl}${getApiPrefix()}/patients`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      let body;
      let headers = { 'Authorization': `Bearer ${token}` };

      if (formData.photo_id_file) {
        body = new FormData();
        for (const key in formData) {
          if (formData[key] !== null && key !== 'photo_id_url') {
            body.append(key, formData[key]);
          }
        }
      } else {
        body = JSON.stringify(formData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, { method, headers, body });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${isEditing ? 'update' : 'add'} patient.`);
      }

      await fetchPatients();
      showNotification(`Patient ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
      setModalState(prev => ({ ...prev, showPatientForm: false, editingPatient: null }));
      resetFormData();

    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} patient:`, err);
      showNotification(err.message || `An error occurred while ${isEditing ? 'updating' : 'adding'} the patient.`, 'error');
    }
  };

  const handleDeleteClick = useCallback((patientId, patientName) => {
    setModalState(prev => ({ ...prev, showDeleteConfirm: true, patientToDelete: { id: patientId, name: patientName } }));
  }, []);

  const confirmDelete = async () => {
    setModalState(prev => ({ ...prev, showDeleteConfirm: false }));
    if (!modalState.patientToDelete) return;

    if (isDemoUser) {
      showNotification('Action blocked: Patient deletion is disabled in Demo Mode.', 'error');
      setModalState(prev => ({ ...prev, patientToDelete: null }));
      return;
    };

    setPageLoading(true);
    setNotification({ message: null, type: null });

    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/patients/${modalState.patientToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete patient.');
      }
      await fetchPatients();
      showNotification('Patient deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting patient:', err);
      showNotification(err.message || 'Failed to delete patient.', 'error');
    } finally {
      setPageLoading(false);
      setModalState(prev => ({ ...prev, patientToDelete: null }));
    }
  };

  const handleEditClick = useCallback((patient) => {
    setModalState(prev => ({ ...prev, showPatientForm: true, editingPatient: patient }));
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender,
      national_id: patient.national_id || '',
      contact_phone: patient.contact_phone,
      email: patient.email || '',
      address: patient.address || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_relationship: patient.emergency_contact_relationship || '',
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''),
      conditions: Array.isArray(patient.conditions) ? patient.conditions.join(', ') : (patient.conditions || ''),
      photo_id_file: null,
      photo_id_url: patient.photo_id_url || ''
    });
    setPhotoPreviewUrl(patient.photo_id_url || '');
  }, []);

  const handleAddPatientClick = useCallback(() => {
    setModalState(prev => ({ ...prev, showPatientForm: true, editingPatient: null }));
    resetFormData();
  }, [resetFormData]);

  const filteredPatients = patients.filter(patient =>
    Object.values(patient).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
    // More specific filtering for readability if needed, but general is more concise
    // patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // (patient.national_id && patient.national_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    // etc.
  );

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Permissions (no change, as they are role-based logic)
  const canManagePatients = user && (user.role === 'admin' || user.role === 'receptionist');
  const canViewClinicalNotes = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');
  const canViewAppointments = user && (user.role === 'admin' || user.role === 'receptionist' || user.role === 'doctor' || user.role === 'nurse');
  const canViewMedicalHistory = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');

  if (authLoading) return (
    <div className='flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900'>
      <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div className='ml-3 text-xl text-gray-700 dark:text-gray-300'>Loading Patients Page...</div>
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className='p-6 bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900'
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

      <motion.h2
        className='text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 flex items-center space-x-3 dark:text-gray-200 dark:border-blue-700'
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <svg className="h-9 w-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.326A4 4 0 0017.207 14H19a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L11.586 2.5a2 2 0 00-1.414 0L7.293 4.293A1 1 0 016.586 4H5a2 2 0 00-2 2v5a2 2 0 002 2h2.326A4 4 0 0012 20.005z"></path></svg>
        <span>Patient Management</span>
      </motion.h2>

      {/* Search and Add Patient Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <motion.div
          className="w-full md:w-1/3 relative"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Search</label>
          <input
            type="text"
            placeholder="Search by name, ID, phone, emergency contact, allergies, conditions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </motion.div>

        {canManagePatients && (
          <motion.button
            onClick={handleAddPatientClick}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 flex items-center space-x-2'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>Add New Patient</span>
          </motion.button>
        )}
      </div>

      {pageLoading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 text-lg dark:text-gray-400">Loading patient data...</p>
        </div>
      ) : (
        <>
          {currentPatients.length > 0 ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-700 dark:shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {['Name', 'Date of Birth', 'Gender', 'Contact Phone', 'National ID', 'Email', 'Actions'].map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody
                    className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } }}}
                  >
                    {currentPatients.map((patient) => (
                      <motion.tr
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors duration-200 dark:hover:bg-gray-600"
                        variants={itemVariants}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{patient.first_name} {patient.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{patient.contact_phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{patient.national_id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{patient.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {canManagePatients && (
                              <>
                                <motion.button
                                  onClick={() => handleEditClick(patient)}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Edit Patient"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                  <span className="hidden sm:inline">Edit</span>
                                </motion.button>
                                <motion.button
                                  onClick={() => handleDeleteClick(patient.id, `${patient.first_name} ${patient.last_name}`)}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1 dark:text-red-400 dark:hover:text-red-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Delete Patient"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  <span className="hidden sm:inline">Delete</span>
                                </motion.button>
                              </>
                            )}
                            {canViewClinicalNotes && (
                              <Link
                                to={`/clinical-notes/${patient.id}`}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90 dark:text-blue-400 dark:hover:text-blue-300"
                                title="View Clinical Notes"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M12 16h.01"></path></svg>
                                <span className="hidden sm:inline">Notes</span>
                              </Link>
                            )}
                            {canViewMedicalHistory && (
                              <Link
                                to={`/medical-history/${patient.id}`}
                                className="text-purple-600 hover:text-purple-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90 dark:text-purple-400 dark:hover:text-purple-300"
                                title="View Medical History"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                                <span className="hidden sm:inline">History</span>
                              </Link>
                            )}
                            {canViewAppointments && (
                              <Link
                                to={`/appointments/${patient.id}`}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90 dark:text-green-400 dark:hover:text-green-300"
                                title="View Appointments"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M17 12h.01M17 15h.01M12 21h.01M12 18h.01M3 8h18V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3zm0 3h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z"></path></svg>
                                <span className="hidden sm:inline">Appts</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 flex justify-between items-center bg-gray-100 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-semibold">{indexOfFirstPatient + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastPatient, filteredPatients.length)}</span> of <span className="font-semibold">{filteredPatients.length}</span> patients
                  </span>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <motion.button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                      whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                    {[...Array(totalPages).keys()].map(number => (
                      <motion.button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === number + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {number + 1}
                      </motion.button>
                    ))}
                    <motion.button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                      whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:shadow-xl">
              <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.326A4 4 0 0017.207 14H19a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L11.586 2.5a2 2 0 00-1.414 0L7.293 4.293A1 1 0 016.586 4H5a2 2 0 00-2 2v5a2 2 0 002 2h2.326A4 4 0 0012 20.005z"></path></svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-100">No Patients Found</h3>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">Get started by adding a new patient.</p>
              {canManagePatients && (
                <motion.button
                  onClick={handleAddPatientClick}
                  className='mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 flex items-center space-x-2 mx-auto'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  <span>Add New Patient</span>
                </motion.button>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalState.showPatientForm}
        onClose={() => {
          setModalState(prev => ({ ...prev, showPatientForm: false, editingPatient: null }));
          resetFormData();
          setNotification({ message: null, type: null });
        }}
        title={modalState.editingPatient ? 'Edit Patient' : 'Add New Patient'}
      >
        <form onSubmit={handleFormSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormInput label="First Name" id="first_name" value={formData.first_name} onChange={handleFormChange} placeholder="e.g., John" required />
          <FormInput label="Last Name" id="last_name" value={formData.last_name} onChange={handleFormChange} placeholder="e.g., Doe" required />
          <FormInput label="Date of Birth" id="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleFormChange} required />
          <FormSelect
            label="Gender"
            id="gender"
            value={formData.gender}
            onChange={handleFormChange}
            options={[
              { value: "", label: "Select Gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
            required
          />
          <FormInput label="National ID" id="national_id" value={formData.national_id} onChange={handleFormChange} placeholder="e.g., 12345678" />
          <FormInput label="Contact Phone" id="contact_phone" type="tel" value={formData.contact_phone} onChange={handleFormChange} placeholder="e.g., +254712345678" required />
          <FormInput label="Email" id="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="e.g., patient@example.com" />
          <div className='col-span-1 md:col-span-2'>
            <FormTextArea label="Address" id="address" value={formData.address} onChange={handleFormChange} rows="3" placeholder="e.g., 123 Hospital Road, Nairobi" />
          </div>

          <div className='col-span-1 md:col-span-2 border-t pt-6 mt-6 border-gray-200 dark:border-gray-600'>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-200">Emergency Contact Information</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <FormInput label="Full Name" id="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleFormChange} placeholder="e.g., Jane Doe" />
              <FormInput label="Phone Number" id="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone} onChange={handleFormChange} placeholder="e.g., +254722334455" />
              <FormInput label="Relationship" id="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleFormChange} placeholder="e.g., Parent, Spouse" />
            </div>
          </div>

          <div className='col-span-1 md:col-span-2'>
            <FormTextArea label="Allergies (comma-separated)" id="allergies" value={formData.allergies} onChange={handleFormChange} rows="2" placeholder="e.g., Penicillin, Peanuts" />
          </div>
          <div className='col-span-1 md:col-span-2'>
            <FormTextArea label="Chronic Conditions (comma-separated)" id="conditions" value={formData.conditions} onChange={handleFormChange} rows="2" placeholder="e.g., Diabetes, Hypertension" />
          </div>

          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='photo_id_file' className='block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300'>Upload Photo/ID Document:</label>
            <input
              type='file'
              id='photo_id_file'
              name='photo_id_file'
              accept='image/*'
              onChange={handleFormChange}
              ref={fileInputRef}
              className='w-full text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-200 dark:border-gray-600 file:dark:bg-blue-800 file:dark:text-blue-200 hover:file:dark:bg-blue-700'
            />
            {(photoPreviewUrl || formData.photo_id_url) && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">Current Photo/ID:</p>
                    <img
                        src={photoPreviewUrl || formData.photo_id_url}
                        alt="Patient Photo/ID Preview"
                        className="max-w-xs h-auto rounded-md shadow-md border border-gray-200 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        {photoPreviewUrl ? "New file selected" : "Existing file"}
                        {modalState.editingPatient && formData.photo_id_url && !photoPreviewUrl && (
                            " (To change, select a new file above)"
                        )}
                    </p>
                </div>
            )}
          </div>

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <motion.button
              type='button'
              onClick={() => {
                setModalState(prev => ({ ...prev, showPatientForm: false, editingPatient: null }));
                resetFormData();
                setNotification({ message: null, type: null });
              }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {modalState.editingPatient ? 'Update Patient' : 'Add Patient'}
            </motion.button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={modalState.showDeleteConfirm}
        onClose={() => setModalState(prev => ({ ...prev, showDeleteConfirm: false }))}
        onConfirm={confirmDelete}
        patientName={modalState.patientToDelete ? modalState.patientToDelete.name : ''}
      />
    </motion.div>
  );
}

export default PatientsPage;