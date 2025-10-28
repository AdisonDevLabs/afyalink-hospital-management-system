import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg dark:shadow-xl flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-l-4 transition-colors duration-300`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      ) : (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
      )}
      <div>{message}</div>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 dark:text-gray-400 rounded-lg p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex h-8 w-8 transition-colors duration-300">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </motion.div>
  );
};

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-600/75 dark:bg-gray-900/85 flex items-center justify-center p-4 z-50 transition-colors duration-300"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-300"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-300">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Delete ${itemType}`}>
      <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onClose} className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg shadow-md dark:shadow-lg transition duration-300">Cancel</button>
        <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md dark:shadow-lg transition duration-300">Delete</button>
      </div>
    </Modal>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function AppointmentsPage() {
  const { user, isAuthenticated, loading: authLoading, token, getApiPrefix } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  const [showAppointmentFormModal, setShowAppointmentFormModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const initialFormData = {
    patient_id: '', doctor_id: '', department_id: '',
    appointment_start_datetime: null, appointment_end_datetime: null,
    reason: '', status: 'Scheduled',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(filterDate && { date: filterDate }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterDoctor && { doctor_id: filterDoctor }),
        ...(filterPatient && { patient_id: filterPatient }),
        ...(searchTerm && { search: searchTerm }),
      }).toString();

      const response = await fetch(`${backendUrl}${getApiPrefix()}/appointments?${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setAppointments(await response.json());
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
      const response = await fetch(`${backendUrl}${getApiPrefix()}/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setPatientsList((await response.json()).patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setNotification({ message: 'Failed to load patients data.', type: 'error' });
      setPatientsList([]);
    }
  }, [token]);

  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/users?role=doctor`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setDoctorsList(await response.json() || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setNotification({ message: 'Failed to load doctors data.', type: 'error' });
      setDoctorsList([]);
    }
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/departments`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setDepartmentsList(await response.json() || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ message: 'Failed to load departments data.', type: 'error' });
      setDepartmentsList([]);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      if (!isAuthenticated && !authLoading) navigate('/login');
      return;
    }
    if (user && token) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
      fetchDepartments();
    }
  }, [isAuthenticated, authLoading, user, token, navigate, fetchAppointments, fetchPatients, fetchDoctors, fetchDepartments]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDatePickerChange = (date) => {
    setFormData(prev => ({
      ...prev,
      appointment_date: date ? moment(date).format('YYYY-MM-DD') : '',
      appointment_time: date ? moment(date).format('HH:mm:ss') : '',
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setNotification({ message: null, type: null });
  };

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    resetFormData();
    setShowAppointmentFormModal(true);
  };

  const handleEditAppointmentClick = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id || '',
      doctor_id: appointment.doctor_id || '',
      department_id: appointment.department_id || '',
      appointment_date: appointment.appointment_date ? new Date(appointment.appointment_date).toISOString().split('T')[0] : '',
      appointment_time: appointment.appointment_time || '',
      reason: appointment.reason || '',
      status: appointment.status || 'Scheduled',
    });
    setShowAppointmentFormModal(true);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.reason || !formData.department_id) {
      setNotification({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment ? `${backendUrl}${getApiPrefix()}/appointments/${editingAppointment.id}` : `${backendUrl}${getApiPrefix()}/appointments`;
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      setNotification({ message: `Appointment ${editingAppointment ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowAppointmentFormModal(false);
      resetFormData();
      fetchAppointments();
    } catch (error) {
      console.error(`Error ${editingAppointment ? 'updating' : 'adding'} appointment:`, error);
      setNotification({ message: `Failed to ${editingAppointment ? 'update' : 'add'} appointment: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (appointmentId) => setAppointmentToDelete(appointmentId);

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/appointments/${appointmentToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      setNotification({ message: 'Appointment deleted successfully!', type: 'success' });
      setAppointmentToDelete(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setNotification({ message: `Failed to delete appointment: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentStatusBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200';
      case 'confirmed': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200';
      case 'checked-in': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200';
      case 'completed': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200';
      case 'rescheduled': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
    }
  };

  const getPatientName = useCallback((patientId) => patientsList.find(p => p.id === patientId) ? `${patientsList.find(p => p.id === patientId).first_name} ${patientsList.find(p => p.id === patientId).last_name}` : 'N/A', [patientsList]);
  const getDoctorName = useCallback((doctorId) => doctorsList.find(d => d.id === doctorId) ? `Dr. ${doctorsList.find(d => d.id === doctorId).first_name} ${doctorsList.find(d => d.id === doctorId).last_name}` : 'N/A', [doctorsList]);
  const getDepartmentName = useCallback((departmentId) => departmentsList.find(d => d.id === departmentId) ? departmentsList.find(d => d.id === departmentId).name : 'N/A', [departmentsList]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  const closeNotification = useCallback(() => setNotification({ message: null, type: null }), []);

  return (
    <motion.div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" initial="hidden" animate="visible" variants={containerVariants}>
      <AnimatePresence>{notification.message && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}</AnimatePresence>
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-300">Appointments Management</motion.h1>

      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg mb-6 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Search</label>
            <input type="text" id="search" placeholder="Search by patient/doctor name, reason" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 transition-colors duration-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 transition-colors duration-300" />
          </div>
          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Date</label>
            <input type="date" id="filterDate" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 transition-colors duration-300" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Status</label>
            <select id="filterStatus" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 transition-colors duration-300" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option> <option value="Scheduled">Scheduled</option> <option value="Confirmed">Confirmed</option> <option value="Checked-in">Checked-in</option> <option value="Completed">Completed</option> <option value="Cancelled">Cancelled</option> <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterDoctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Doctor</label>
            <select id="filterDoctor" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 transition-colors duration-300" value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
              <option value="">All Doctors</option>
              {doctorsList.map(doctor => (<option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-end mb-6">
        {(user && user.role === 'admin' || user.role === 'receptionist') && (
          <button onClick={handleAddAppointmentClick} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md dark:shadow-lg transition duration-300">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Appointment
          </button>
        )}
      </motion.div>

      <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-4 transition-colors duration-300">All Appointments</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /><span className="ml-3 text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading appointments...</span></div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No appointments found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Reason</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Status</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {appointments.map((appointment) => (
                    <motion.tr key={appointment.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'} at {appointment.appointment_time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium transition-colors duration-300">{getPatientName(appointment.patient_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">{getDoctorName(appointment.doctor_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">{getDepartmentName(appointment.department_id)}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300" title={appointment.reason}>{appointment.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentStatusBadgeClasses(appointment.status)}`}>{appointment.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button onClick={() => handleEditAppointmentClick(appointment)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3 transition duration-200 transition-colors duration-300" title="Edit Appointment"><Edit className="h-5 w-5" /></button>
                        {user && user.role === 'admin' && (
                          <button onClick={() => handleDeleteConfirmation(appointment.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-300" title="Delete Appointment"><Trash2 className="h-5 w-5" /></button>
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

      <Modal isOpen={showAppointmentFormModal} onClose={() => { setShowAppointmentFormModal(false); setEditingAppointment(null); resetFormData(); }} title={editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}>
        <form onSubmit={handleSubmitAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Patient</label>
            <select id="patient_id" name="patient_id" value={formData.patient_id} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300" required>
              <option value="">Select Patient</option>
              {patientsList.map(patient => (<option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="doctor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Doctor</label>
            <select id="doctor_id" name="doctor_id" value={formData.doctor_id} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300" required>
              <option value="">Select Doctor</option>
              {doctorsList.map(doctor => (<option key={doctor.id} value={doctor.id}>Dr. {doctor.first_name} {doctor.last_name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Department</label>
            <select id="department_id" name="department_id" value={formData.department_id} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300" required>
              <option value="">Select Department</option>
              {departmentsList.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="appointment_datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Appointment Date & Time</label>
            <DatePicker id="appointment_datetime" name="appointment_datetime" selected={formData.appointment_date && formData.appointment_time ? moment(`${formData.appointment_date} ${formData.appointment_time}`).toDate() : null} onChange={handleDatePickerChange} showTimeSelect dateFormat="Pp" timeFormat="HH:mm" timeIntervals={15} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300" placeholderText="Select date and time" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Reason for Appointment</label>
            <textarea id="reason" name="reason" value={formData.reason} onChange={handleFormChange} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300" required></textarea>
          </div>
          {editingAppointment && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-300">
                <option value='Scheduled'>Scheduled</option> <option value='Confirmed'>Confirmed</option> <option value='Checked-in'>Checked-in</option> <option value='Completed'>Completed</option> <option value='Cancelled'>Cancelled</option> <option value='Rescheduled'>Rescheduled</option>
              </select>
            </div>
          )}
          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button type='button' onClick={() => { setShowAppointmentFormModal(false); setEditingAppointment(null); resetFormData(); setNotification({ message: null, type: null }); }} className='bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-5 rounded-lg shadow-md dark:shadow-lg transition duration-300'>Cancel</button>
            <button type='submit' className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md dark:shadow-lg transition duration-300'>{editingAppointment ? 'Update Appointment' : 'Add Appointment'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal isOpen={!!appointmentToDelete} onClose={() => setAppointmentToDelete(null)} onConfirm={handleDeleteAppointment} itemType="Appointment" />
    </motion.div>
  );
}

export default AppointmentsPage;