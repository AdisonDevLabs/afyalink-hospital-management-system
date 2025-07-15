// frontend/src/pages/AppointmentsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Edit, Trash2, CalendarCheck, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker'; // Assuming this is your DatePicker component
import 'react-datepicker/dist/react-datepicker.css'; // Don't forget the CSS!
import moment from 'moment'; // For date/time formatting

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  // const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500'; // Not used


  // ⭐ Add this useEffect hook for the timeout
  useEffect(() => {
    // Set a timeout to close the notification after 5000 milliseconds (5 seconds)
    const timer = setTimeout(() => {
      onClose(); // Call the onClose function passed from the parent
    }, 5000);

    // Cleanup function: Clear the timeout if the component unmounts
    // or if the message changes (meaning a new notification is shown)
    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]); // Depend on message and onClose:
                           // - message: Restart timer if a new message appears while current one is showing
                           // - onClose: Ensures effect re-runs if onClose function reference changes (less common but good practice)


  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }} // This exit animation requires AnimatePresence wrapper
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <div>{message}</div>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 rounded-lg p-1.5 hover:bg-gray-200 inline-flex h-8 w-8">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </motion.div>
  );
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Allows clicking outside to close
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Reusable ConfirmDeleteModal Component ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Delete ${itemType}`}>
      <p className="text-gray-700 mb-6">Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.</p>
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

function AppointmentsPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });

  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]); // To populate patient dropdown
  const [doctorsList, setDoctorsList] = useState([]);   // To populate doctor dropdown
  const [departmentsList, setDepartmentsList] = useState([]); // To populate department dropdown

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  const [showAppointmentFormModal, setShowAppointmentFormModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null); // null for new, object for editing

  // Form Data for new/edit appointment
  const initialFormData = {
    patient_id: '',
    doctor_id: '',
    department_id: '', // Added department_id
    appointment_start_datetime: null,
    appointment_end_datetime: null,
    reason: '',
    status: 'Scheduled', // Default status for new appointments
  };
  const [formData, setFormData] = useState(initialFormData);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null); // Stores ID of appointment to delete


  //const backendUrl = '/api';

  // --- Fetching Data ---
  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterDate) queryParams.append('date', filterDate);
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterDoctor) queryParams.append('doctor_id', filterDoctor);
      if (filterPatient) queryParams.append('patient_id', filterPatient);
      if (searchTerm) queryParams.append('search', searchTerm);


      const url = `${backendUrl}/api/appointments?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setNotification({ message: 'Failed to load appointments.', type: 'error' });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [token, filterDate, filterStatus, filterDoctor, filterPatient, searchTerm]);


  const fetchPatients = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Corrected: Access data.patients as the API returns { patients: [...] }
      setPatientsList(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setNotification({ message: 'Failed to load patients data.', type: 'error' });
      setPatientsList([]);
    }
  }, [token]);

  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    try {
      // FIX: Changed from /api/users/doctors to /api/users?role=doctor
      const response = await fetch(`${backendUrl}/api/users?role=doctor`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDoctorsList(data || []); // Assuming getAllUsers returns an array directly
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setNotification({ message: 'Failed to load doctors data.', type: 'error' });
      setDoctorsList([]);
    }
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/departments`, { // Assuming an endpoint for departments
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDepartmentsList(data || []); // Assuming it returns an array directly
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ message: 'Failed to load departments data.', type: 'error' });
      setDepartmentsList([]);
    }
  }, [token]);


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && token) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
      fetchDepartments();
    }
  }, [isAuthenticated, authLoading, user, token, navigate, fetchAppointments, fetchPatients, fetchDoctors, fetchDepartments]);

  // --- Handlers for filtering and searching ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterDateChange = (e) => setFilterDate(e.target.value);
  const handleFilterStatusChange = (e) => setFilterStatus(e.target.value);
  const handleFilterDoctorChange = (e) => setFilterDoctor(e.target.value);
  const handleFilterPatientChange = (e) => setFilterPatient(e.target.value);

  // Function specifically for handling date/time changes from DatePicker
  const handleAppointmentDateTimeChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      appointment_start_datetime: date,
    }));
  };

  // If you have an end time:
  const handleAppointmentEndTimeChange = (date) => {
      setFormData(prevData => ({
          ...prevData,
          appointment_end_datetime: date,
      }));
  };

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // ⭐ NEW: Specific handler for the DatePicker
  const handleDatePickerChange = (date) => {
    setFormData(prev => ({
      ...prev,
      // Format the Date object into the string formats your formData expects
      appointment_date: date ? moment(date).format('YYYY-MM-DD') : '',
      appointment_time: date ? moment(date).format('HH:mm:ss') : '',
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setNotification({ message: null, type: null }); // Clear any errors from previous submission
  };

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    resetFormData();
    setShowAppointmentFormModal(true);
  };

  const handleEditAppointmentClick = (appointment) => {
    setEditingAppointment(appointment);
    // Format date for input type="date"
    const appointmentDate = appointment.appointment_date ? new Date(appointment.appointment_date).toISOString().split('T')[0] : '';
    setFormData({
      patient_id: appointment.patient_id || '',
      doctor_id: appointment.doctor_id || '',
      department_id: appointment.department_id || '',
      appointment_date: appointmentDate,
      appointment_time: appointment.appointment_time || '',
      reason: appointment.reason || '',
      status: appointment.status || 'Scheduled',
    });
    setShowAppointmentFormModal(true);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.reason || !formData.department_id) {
      setNotification({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment
        ? `${backendUrl}/api/appointments/${editingAppointment.id}`
        : `${backendUrl}/api/appointments`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNotification({ message: `Appointment ${editingAppointment ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowAppointmentFormModal(false);
      resetFormData();
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error(`Error ${editingAppointment ? 'updating' : 'adding'} appointment:`, error);
      setNotification({ message: `Failed to ${editingAppointment ? 'update' : 'add'} appointment: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
      setNotification({ message: `Appointment ${editingAppointment ? 'updated' : 'added'} successfully!`, type: 'success' });
    }
  };

  const handleDeleteConfirmation = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNotification({ message: 'Appointment deleted successfully!', type: 'success' });
      setAppointmentToDelete(null); // Close the confirmation modal
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setNotification({ message: `Failed to delete appointment: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentStatusBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-purple-100 text-purple-700';
      case 'checked-in': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper functions for displaying names
  const getPatientName = useCallback((patientId) => {
    const patient = patientsList.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'N/A';
  }, [patientsList]);

  const getDoctorName = useCallback((doctorId) => {
    const doctor = doctorsList.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'N/A';
  }, [doctorsList]);

  const getDepartmentName = useCallback((departmentId) => {
    const department = departmentsList.find(d => d.id === departmentId);
    return department ? department.name : 'N/A';
  }, [departmentsList]);


  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Inside AppointmentsPage component, before the return statement:
const closeNotification = useCallback(() => {
    setNotification({ message: null, type: null });
}, []);


  return (
    <motion.div
      className="flex-1 p-4 md:p-6 lg:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence>
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </AnimatePresence>

      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-800 mb-6">
        Appointments Management
      </motion.h1>

      {/* Filter and Search Section */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by patient/doctor name, reason"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="filterDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              value={filterDate}
              onChange={handleFilterDateChange}
            />
          </div>

          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="filterStatus"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
              value={filterStatus}
              onChange={handleFilterStatusChange}
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterDoctor" className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              id="filterDoctor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
              value={filterDoctor}
              onChange={handleFilterDoctorChange}
            >
              <option value="">All Doctors</option>
              {doctorsList.map(doctor => (
                <option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>
              ))}
            </select>
          </div>
          {/* Add more filters as needed, e.g., by patient, department */}
        </div>
      </motion.div>

      {/* Add New Appointment Button */}
      <motion.div variants={itemVariants} className="flex justify-end mb-6">
        {/*
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(appointment)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Appointment"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}*/}
        {user && user.role === 'admin'|| user.role === 'receptionist' && (
          <button
            onClick={handleAddAppointmentClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Appointment
          </button>
        )}

      </motion.div>

      {/* Appointments List */}
      <motion.section variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">All Appointments</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {appointments.map((appointment) => (
                    <motion.tr
                      key={appointment.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'} at {appointment.appointment_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {getPatientName(appointment.patient_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {getDoctorName(appointment.doctor_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {getDepartmentName(appointment.department_id)}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-800" title={appointment.reason}>
                        {appointment.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentStatusBadgeClasses(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEditAppointmentClick(appointment)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-200"
                          title="Edit Appointment"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {/* ⭐⭐⭐ CONDITIONAL RENDERING FOR DELETE BUTTON ⭐⭐⭐ */}
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteConfirmation(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Appointment"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* Appointment Form Modal (Add/Edit) */}
      <Modal
        isOpen={showAppointmentFormModal}
        onClose={() => {
          setShowAppointmentFormModal(false);
          setEditingAppointment(null);
          resetFormData();
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
      >
        <form onSubmit={handleSubmitAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Patient</option>
              {patientsList.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doctor_id" className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              id="doctor_id"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Doctor</option>
              {doctorsList.map(doctor => (
                <option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departmentsList.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="appointment_datetime" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date & Time
            </label>
            <DatePicker
              id="appointment_datetime"
              name="appointment_datetime" // Use a logical name for the combined field if needed
              // ⭐ Combine formData.appointment_date and appointment_time into a Date object for DatePicker
              selected={
                formData.appointment_date && formData.appointment_time
                  ? moment(`${formData.appointment_date} ${formData.appointment_time}`).toDate()
                  : null
              }
              onChange={handleDatePickerChange} // Use the new handler
              showTimeSelect // Enable time selection
              dateFormat="Pp" // Displays both date and time (e.g., "Jul 13, 2025, 4:30 PM")
              timeFormat="HH:mm" // Specifies time format (e.g., "16:30")
              timeIntervals={15} // Optional: minutes interval for time picker
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select date and time"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Appointment</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleFormChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          {editingAppointment && ( // Only show status for editing existing appointments
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value='Scheduled'>Scheduled</option>
                <option value='Confirmed'>Confirmed</option>
                <option value='Checked-in'>Checked-in</option>
                <option value='Completed'>Completed</option>
                <option value='Cancelled'>Cancelled</option>
                <option value='Rescheduled'>Rescheduled</option>
              </select>
            </div>
          )}

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => {
                setShowAppointmentFormModal(false);
                setEditingAppointment(null);
                resetFormData();
                setNotification({ message: null, type: null }); // Clear modal-specific errors
              }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!appointmentToDelete}
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={handleDeleteAppointment}
        itemType="Appointment"
      />
    </motion.div>
  );
}

export default AppointmentsPage;