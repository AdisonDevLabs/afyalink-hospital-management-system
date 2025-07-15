// frontend/src/pages/PatientsPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
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

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className={`absolute top-1 right-1 ${iconColor} hover:text-gray-900`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// --- Simple Modal Component ---
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
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform sm:my-8 sm:align-middle sm:w-full"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md p-1"
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

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, patientName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="text-center p-5">
        <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        <h3 className="mb-5 text-lg font-normal text-gray-700">
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
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            No, cancel
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};


const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

function PatientsPage() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [showPatientFormModal, setShowPatientFormModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null); // Stores patient ID for deletion
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null); // Ref for file input

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10); // Number of patients per page

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: '',
    national_id: '', contact_phone: '', email: '', address: '', // Existing fields
    emergency_contact_name: '', // New
    emergency_contact_phone: '', // New
    emergency_contact_relationship: '', // New
    allergies: '', // New, comma-separated string
    conditions: '', // New, comma-separated string
    photo_id_file: null, // New, for file upload
    photo_id_url: '' // New, to display existing photo
  });
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(''); // State for image preview

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000); // Notification disappears after 5 seconds
  }, []);

const fetchPatients = useCallback(async () => {
  setPageLoading(true);
  setNotification({ message: null, type: null });

  try {
    const response = await fetch(`${backendUrl}/api/patients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to fetch patients.');
    }
    const data = await response.json();

    // ⭐ MODIFICATION: Check if the received data has a 'patients' array
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
    if (authLoading) {
      return;
    }

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
      setFormData({ ...formData, [name]: file });
      if (file) {
        setPhotoPreviewUrl(URL.createObjectURL(file));
      } else {
        setPhotoPreviewUrl('');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    // Basic client-side validation
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender || !formData.contact_phone) {
      setNotification({ message: 'Please fill in all required fields: First Name, Last Name, Date of Birth, Gender, Contact Phone.', type: 'error' });
      return;
    }

    try {
      const url = editingPatient ? `${backendUrl}/api/patients/${editingPatient.id}` : `${backendUrl}/api/patients`;
      const method = editingPatient ? 'PUT' : 'POST';

      let body;
      let headers = { 'Authorization': `Bearer ${token}` };

      // If a file is being uploaded, use FormData
      if (formData.photo_id_file) {
        body = new FormData();
        for (const key in formData) {
          if (formData[key] !== null && key !== 'photo_id_url') { // Don't send photo_id_url if it's already on patient object
            body.append(key, formData[key]);
          }
        }
        // When FormData is used, Content-Type header is automatically set by the browser to multipart/form-data with the correct boundary
        // Do NOT manually set 'Content-Type': 'multipart/form-data' here, as it will break the boundary
      } else {
        body = JSON.stringify(formData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${editingPatient ? 'update' : 'add'} patient.`);
      }

      await fetchPatients();
      showNotification(`Patient ${editingPatient ? 'updated' : 'added'} successfully!`, 'success');
      setShowPatientFormModal(false);
      setEditingPatient(null);
      resetFormData();

    } catch (err) {
      console.error(`Error ${editingPatient ? 'updating' : 'adding'} patient:`, err);
      showNotification(err.message || `An error occurred while ${editingPatient ? 'updating' : 'adding'} the patient.`, 'error');
    }
  };

  const handleDeleteClick = (patientId, patientName) => {
    setPatientToDelete({ id: patientId, name: patientName });
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmModal(false); // Close confirmation modal
    if (!patientToDelete) return; // Should not happen

    setPageLoading(true);
    setNotification({ message: null, type: null });

    try {
      const response = await fetch(`${backendUrl}/api/patients/${patientToDelete.id}`, {
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
      setPatientToDelete(null); // Clear patient to delete
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '', // Format for date input
      gender: patient.gender,
      national_id: patient.national_id || '',
      contact_phone: patient.contact_phone,
      email: patient.email || '',
      address: patient.address || '',
      // New fields for editing
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_relationship: patient.emergency_contact_relationship || '',
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''), // Join array to string for textarea
      conditions: Array.isArray(patient.conditions) ? patient.conditions.join(', ') : (patient.conditions || ''), // Join array to string for textarea
      photo_id_file: null, // Always null when opening for edit, user must re-upload
      photo_id_url: patient.photo_id_url || '' // Display existing photo
    });
    setPhotoPreviewUrl(patient.photo_id_url || ''); // Set photo preview for existing photo
    setShowPatientFormModal(true);
  };

  const resetFormData = () => {
    setFormData({
      first_name: '', last_name: '', date_of_birth: '', gender: '',
      national_id: '', contact_phone: '', email: '', address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      allergies: '',
      conditions: '',
      photo_id_file: null,
      photo_id_url: ''
    });
    setPhotoPreviewUrl(''); // Clear photo preview
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input value
    }
  };

  const handleAddPatientClick = () => {
    setEditingPatient(null);
    resetFormData();
    setShowPatientFormModal(true);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.national_id && patient.national_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.contact_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.emergency_contact_name && patient.emergency_contact_name.toLowerCase().includes(searchTerm.toLowerCase())) || // New
    (patient.allergies && patient.allergies.toLowerCase().includes(searchTerm.toLowerCase())) || // New
    (patient.conditions && patient.conditions.toLowerCase().includes(searchTerm.toLowerCase())) // New
  );

  // Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Permissions
  const canManagePatients = user && (user.role === 'admin' || user.role === 'receptionist');
  const canViewClinicalNotes = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');
  const canViewAppointments = user && (user.role === 'admin' || user.role === 'receptionist' || user.role === 'doctor' || user.role === 'nurse');
  const canViewMedicalHistory = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');


  if (authLoading) return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
      <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div className='ml-3 text-xl text-gray-700'>Loading Patients Page...</div>
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className='p-6 bg-gray-50 min-h-[calc(100vh-64px)]'
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
        className='text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 flex items-center space-x-3'
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <svg className="h-9 w-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.326A4 4 0 0017.207 14H19a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L11.586 2.5a2 2 0 00-1.414 0L7.293 4.293A1 1 0 016.586 4H5a2 2 0 00-2 2v5a2 2 0 002 2h2.326A4 4 0 0012 20.005z"></path></svg>
        <span>Patient Management</span>
      </motion.h2>

      {/* Search and Add Patient Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Search Input */}
        <motion.div
          className="w-full md:w-1/3 relative"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, ID, phone, emergency contact, allergies, conditions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </motion.div>

        {/* Add New Patient Button */}
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

      {/* Loading State */}
      {pageLoading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 text-lg">Loading patient data...</p>
        </div>
      ) : (
        <>
          {/* Patient Table */}
          {currentPatients.length > 0 ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Phone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    className="bg-white divide-y divide-gray-200"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } },
                    }}
                  >
                    {currentPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                        variants={itemVariants}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.first_name} {patient.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.contact_phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.national_id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {canManagePatients && (
                              <motion.button
                                onClick={() => handleEditClick(patient)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Edit Patient"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                <span className="hidden sm:inline">Edit</span>
                              </motion.button>
                            )}
                            {canManagePatients && (
                              <motion.button
                                onClick={() => handleDeleteClick(patient.id, `${patient.first_name} ${patient.last_name}`)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete Patient"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                <span className="hidden sm:inline">Delete</span>
                              </motion.button>
                            )}
                            {canViewClinicalNotes && (
                              <Link
                                to={`/clinical-notes/${patient.id}`}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90"
                                title="View Clinical Notes"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M12 16h.01"></path></svg>
                                <span className="hidden sm:inline">Notes</span>
                              </Link>
                            )}
                            {/* New: Link to Medical History */}
                            {canViewMedicalHistory && (
                              <Link
                                to={`/medical-history/${patient.id}`}
                                className="text-purple-600 hover:text-purple-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90"
                                title="View Medical History"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                                <span className="hidden sm:inline">History</span>
                              </Link>
                            )}
                            {/* New: Link to Appointments */}
                            {canViewAppointments && (
                              <Link
                                to={`/appointments/${patient.id}`}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1 transition-transform duration-200 ease-in-out transform hover:scale-110 active:scale-90"
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex justify-between items-center bg-gray-100 border-t border-gray-200">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{indexOfFirstPatient + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastPatient, filteredPatients.length)}</span> of <span className="font-semibold">{filteredPatients.length}</span> patients
                  </span>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <motion.button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === number + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {number + 1}
                      </motion.button>
                    ))}
                    <motion.button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-center py-10 bg-white rounded-lg shadow-lg">
              <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.326A4 4 0 0017.207 14H19a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L11.586 2.5a2 2 0 00-1.414 0L7.293 4.293A1 1 0 016.586 4H5a2 2 0 00-2 2v5a2 2 0 002 2h2.326A4 4 0 0012 20.005z"></path></svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">No Patients Found</h3>
              <p className="mt-1 text-base text-gray-500">Get started by adding a new patient.</p>
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


      {/* Add/Edit Patient Modal */}
      <Modal
        isOpen={showPatientFormModal}
        onClose={() => {
          setShowPatientFormModal(false);
          setEditingPatient(null);
          resetFormData();
          setNotification({ message: null, type: null }); // Clear modal-specific errors
        }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
      >
        <form onSubmit={handleFormSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* First Name */}
          <div>
            <label htmlFor='first_name' className='block text-gray-700 text-sm font-medium mb-1'>First Name <span className="text-red-500">*</span>:</label>
            <input
              type='text'
              id='first_name'
              name='first_name'
              value={formData.first_name}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., John"
              required
            />
          </div>
          {/* Last Name */}
          <div>
            <label htmlFor='last_name' className='block text-gray-700 text-sm font-medium mb-1'>Last Name <span className="text-red-500">*</span>:</label>
            <input
              type='text'
              id='last_name'
              name='last_name'
              value={formData.last_name}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., Doe"
              required
            />
          </div>
          {/* Date of Birth */}
          <div>
            <label htmlFor='date_of_birth' className='block text-gray-700 text-sm font-medium mb-1'>Date of Birth <span className="text-red-500">*</span>:</label>
            <input
              type='date'
              id='date_of_birth'
              name='date_of_birth'
              value={formData.date_of_birth}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              required
            />
          </div>
          {/* Gender */}
          <div>
            <label htmlFor='gender' className='block text-gray-700 text-sm font-medium mb-1'>Gender <span className="text-red-500">*</span>:</label>
            <select
              id='gender'
              name='gender'
              value={formData.gender}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white'
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* National ID */}
          <div>
            <label htmlFor='national_id' className='block text-gray-700 text-sm font-medium mb-1'>National ID:</label>
            <input
              type='text'
              id='national_id'
              name='national_id'
              value={formData.national_id}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., 12345678"
            />
          </div>
          {/* Contact Phone */}
          <div>
            <label htmlFor='contact_phone' className='block text-gray-700 text-sm font-medium mb-1'>Contact Phone <span className="text-red-500">*</span>:</label>
            <input
              type='tel'
              id='contact_phone'
              name='contact_phone'
              value={formData.contact_phone}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., +254712345678"
              required
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor='email' className='block text-gray-700 text-sm font-medium mb-1'>Email:</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleFormChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., patient@example.com"
            />
          </div>
          {/* Address */}
          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='address' className='block text-gray-700 text-sm font-medium mb-1'>Address:</label>
            <textarea
              id='address'
              name='address'
              value={formData.address}
              onChange={handleFormChange}
              rows='3'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., 123 Hospital Road, Nairobi"
            ></textarea>
          </div>

          {/* Emergency Contact Info - New Section */}
          <div className='col-span-1 md:col-span-2 border-t pt-6 mt-6 border-gray-200'>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact Information</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                    <label htmlFor='emergency_contact_name' className='block text-gray-700 text-sm font-medium mb-1'>Full Name:</label>
                    <input
                      type='text'
                      id='emergency_contact_name'
                      name='emergency_contact_name'
                      value={formData.emergency_contact_name}
                      onChange={handleFormChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                      placeholder="e.g., Jane Doe"
                    />
                </div>
                <div>
                    <label htmlFor='emergency_contact_phone' className='block text-gray-700 text-sm font-medium mb-1'>Phone Number:</label>
                    <input
                      type='tel'
                      id='emergency_contact_phone'
                      name='emergency_contact_phone'
                      value={formData.emergency_contact_phone}
                      onChange={handleFormChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                      placeholder="e.g., +254722334455"
                    />
                </div>
                <div>
                    <label htmlFor='emergency_contact_relationship' className='block text-gray-700 text-sm font-medium mb-1'>Relationship:</label>
                    <input
                      type='text'
                      id='emergency_contact_relationship'
                      name='emergency_contact_relationship'
                      value={formData.emergency_contact_relationship}
                      onChange={handleFormChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                      placeholder="e.g., Parent, Spouse"
                    />
                </div>
            </div>
          </div>

          {/* Allergies / Conditions - New Section */}
          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='allergies' className='block text-gray-700 text-sm font-medium mb-1'>Allergies (comma-separated):</label>
            <textarea
              id='allergies'
              name='allergies'
              value={formData.allergies}
              onChange={handleFormChange}
              rows='2'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., Penicillin, Peanuts"
            ></textarea>
          </div>
          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='conditions' className='block text-gray-700 text-sm font-medium mb-1'>Chronic Conditions (comma-separated):</label>
            <textarea
              id='conditions'
              name='conditions'
              value={formData.conditions}
              onChange={handleFormChange}
              rows='2'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
              placeholder="e.g., Diabetes, Hypertension"
            ></textarea>
          </div>

          {/* Photo/ID Document Upload - New Section */}
          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='photo_id_file' className='block text-gray-700 text-sm font-medium mb-1'>Upload Photo/ID Document:</label>
            <input
              type='file'
              id='photo_id_file'
              name='photo_id_file'
              accept='image/*'
              onChange={handleFormChange}
              ref={fileInputRef} // Assign ref to input
              className='w-full text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            {(photoPreviewUrl || formData.photo_id_url) && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Current Photo/ID:</p>
                    <img
                        src={photoPreviewUrl || formData.photo_id_url}
                        alt="Patient Photo/ID Preview"
                        className="max-w-xs h-auto rounded-md shadow-md border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {photoPreviewUrl ? "New file selected" : "Existing file"}
                        {editingPatient && formData.photo_id_url && !photoPreviewUrl && (
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
                setShowPatientFormModal(false);
                setEditingPatient(null);
                resetFormData();
                setNotification({ message: null, type: null });
              }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
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
              {editingPatient ? 'Update Patient' : 'Add Patient'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        patientName={patientToDelete ? patientToDelete.name : ''}
      />
    </motion.div>
  );
}

export default PatientsPage;