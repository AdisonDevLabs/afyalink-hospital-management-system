// frontend/src/pages/ScheduleManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker'; // Ensure this is imported
import 'react-datepicker/dist/react-datepicker.css'; // Ensure this is imported

// Set app element for react-modal
Modal.setAppElement('#root');

// --- Animation Variants (Add these) ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};
// --- End Animation Variants ---

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
            {/* ... Notification SVG and text content ... */}
            {type === 'success' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <div>{message}</div>
            <button onClick={onClose} className={`ml-auto ${iconColor}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

// Main ScheduleManagementPage Component
function ScheduleManagementPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'availability'
    const [notification, setNotification] = useState({ message: null, type: null });
    const [submittingForm, setSubmittingForm] = useState(false);

    // Schedules State
    const [schedules, setSchedules] = useState([]);
    const [showScheduleFormModal, setShowScheduleFormModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [scheduleFormData, setScheduleFormData] = useState({
        patient_id: '',
        doctor_id: user && user.role === 'doctor' ? user.id : '',
        department_id: '',
        appointment_start_datetime: null,
        appointment_end_datetime: null,
        reason: '',
        status: 'Scheduled',
    });

    // Availability State
    const [availabilities, setAvailabilities] = useState([]);
    const [showAvailabilityFormModal, setShowAvailabilityFormModal] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [availabilityFormData, setAvailabilityFormData] = useState({
        doctor_id: user && user.role === 'doctor' ? user.id : '',
        day_of_week: [],
        start_time: '',
        end_time: '',
        max_patients_per_slot: 1,
        is_active: true,
    });

    // Master Data
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [patients, setPatients] = useState([]); // State for patients


    const daysOfWeek = useMemo(() => [
        { id: 0, name: 'Sunday' },
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' },
        { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
    ], []);


    // ⭐ CRITICAL FIX: Declare 'config' using useMemo HERE, BEFORE any functions that use it
    const config = useMemo(() => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }, []);


    // Helper functions for forms
    const resetScheduleFormData = useCallback(() => {
        setScheduleFormData({
            patient_id: '',
            doctor_id: user && user.role === 'doctor' ? user.id : '',
            department_id: '',
            appointment_start_datetime: null,
            appointment_end_datetime: null,
            reason: '',
            status: 'Scheduled',
        });
        setNotification({ message: null, type: null });
    }, [user]);

    const resetAvailabilityFormData = useCallback(() => {
        setAvailabilityFormData({
            doctor_id: user && user.role === 'doctor' ? user.id : '',
            day_of_week: [],
            start_time: '',
            end_time: '',
            max_patients_per_slot: 1,
            is_active: true,
        });
        setNotification({ message: null, type: null });
    }, [user]);

    const handleScheduleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setScheduleFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleScheduleDateTimeChange = useCallback((date, fieldName) => {
        setScheduleFormData(prev => ({
            ...prev,
            [fieldName]: date
        }));
    }, []);

    const handleAvailabilityInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'day_of_week') {
            const dayId = parseInt(value); // Ensure it's a number
            setAvailabilityFormData(prevData => ({
                ...prevData,
                day_of_week: checked
                    ? [...prevData.day_of_week, dayId] // Add dayId if checked
                    : prevData.day_of_week.filter(day => day !== dayId), // Remove dayId if unchecked
            }));
        } else if (type === 'checkbox') { // For boolean checkboxes like is_active
            setAvailabilityFormData(prevData => ({
                ...prevData,
                [name]: checked,
            }));
        }
        else if (type === 'number') {
            setAvailabilityFormData(prevData => ({
                ...prevData,
                [name]: value === '' ? '' : Number(value), // Handle empty string for number inputs
            }));
        }
        else {
            setAvailabilityFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

        // 1. **REFACTORED:** Centralized fetch availabilities function using useCallback
    const reFetchAvailabilities = useCallback(async () => {
        if (!isAuthenticated || authLoading) return; // Only fetch if authenticated and not loading auth

        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // The backend should handle filtering by doctor_id if applicable,
        // so a general endpoint is often sufficient. If your backend needs doctor_id in URL for filtering,
        // then change this URL accordingly, e.g., `${backendUrl}/api/schedules/availability/${user.id}`
        const url = `${backendUrl}/api/schedules/availability`; // Changed to common availabilities endpoint
        try {
            const response = await axios.get(url, config);
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Error re-fetching availabilities:', error);
            setNotification({ message: 'Failed to re-fetch availabilities.', type: 'error' });
        }
    }, [isAuthenticated, authLoading]); // Dependencies for useCallback


// ⭐ MOVE fetchSchedules OUTSIDE of useEffect and wrap in useCallback
    const fetchSchedules = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/schedules`, config);
            setSchedules(response.data.map(s => {
                const startDateTimeString = s.appointment_date && s.appointment_time
                    ? `${moment(s.appointment_date).format('YYYY-MM-DD')} ${s.appointment_time}`
                    : null;
                
                const endDateTimeString = s.appointment_date && s.end_time
                    ? `${moment(s.appointment_date).format('YYYY-MM-DD')} ${s.end_time}`
                    : null;

                return {
                    ...s,
                    appointment_start_datetime: startDateTimeString ? moment(startDateTimeString).toDate() : null,
                    appointment_end_datetime: endDateTimeString ? moment(endDateTimeString).toDate() : null,
                };
            }));
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setNotification({ message: 'Failed to fetch schedules.', type: 'error' });
        }
    }, [config]); // Add config to the dependency array

    // ⭐ ALSO move other fetch functions out and wrap in useCallback if they are used elsewhere
    // For simplicity, I'll show them as direct functions here, but consider useCallback for them too.
    const fetchDoctors = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/users?role=doctor`, config);
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setNotification({ message: 'Failed to fetch doctors.', type: 'error' });
        }
    }, [config]);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/departments`, config);
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setNotification({ message: 'Failed to fetch departments.', type: 'error' });
        }
    }, [config]);

    const fetchPatients = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/patients`, config);
            setPatients(response.data.patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setNotification({ message: 'Failed to fetch patients.', type: 'error' });
        }
    }, [config]);

    const fetchAvailabilities = useCallback(async () => {
        try {
            // Note: The original URL had a commented out ternary, ensure this is correct for your logic
            const url = `${backendUrl}/api/schedules/availability`; // Removed the user.role check if not needed
            const response = await axios.get(url, config);
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
            setNotification({ message: 'Failed to fetch availabilities.', type: 'error' });
        }
    }, [config]);


    // ⭐ MODIFIED useEffect: Now just calls the defined functions
    useEffect(() => {
        if (!isAuthenticated || authLoading) return;

        fetchDoctors();
        fetchDepartments();
        fetchPatients();
        fetchSchedules();
        fetchAvailabilities();

    }, [isAuthenticated, authLoading, user, fetchDoctors, fetchDepartments, fetchPatients, fetchSchedules, fetchAvailabilities]); // Add all functions to dependency array


    // ... (useEffect for editingAvailability - this part seems fine already) ...
    useEffect(() => {
        if (editingAvailability) {
            setAvailabilityFormData({
                doctor_id: editingAvailability.doctor_id,
                day_of_week: Array.isArray(editingAvailability.day_of_week)
                    ? editingAvailability.day_of_week
                    : [editingAvailability.day_of_week],
                start_time: editingAvailability.start_time,
                end_time: editingAvailability.end_time,
                max_patients_per_slot: editingAvailability.max_patients_per_slot || 1,
                is_active: editingAvailability.is_active ?? true,
            });
            setShowAvailabilityFormModal(true);
        } else {
            resetAvailabilityFormData();
        }
    }, [editingAvailability, resetAvailabilityFormData]);

    // ... (openEditScheduleModal - this part seems fine, as it uses pre-processed data from schedules state) ...
  /*  const openEditScheduleModal = (schedule) => {
        setEditingSchedule(schedule);
        setScheduleFormData({
            patient_id: schedule.patient_id,
            doctor_id: schedule.doctor_id,
            department_id: schedule.department_id,
            appointment_start_datetime: schedule.appointment_start_datetime,
            appointment_end_datetime: schedule.appointment_end_datetime,
            reason: schedule.original_reason || schedule.reason,
            status: schedule.status,
        });
        setShowScheduleFormModal(true);
        setNotification({ message: null, type: null });
    };*/

    // ... (handleScheduleDateTimeChange and other handlers) ...

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        try {
            const appointmentDate = scheduleFormData.appointment_start_datetime ? moment(scheduleFormData.appointment_start_datetime).format('YYYY-MM-DD') : null;
            const appointmentTime = scheduleFormData.appointment_start_datetime ? moment(scheduleFormData.appointment_start_datetime).format('HH:mm:ss') : null;
            const endTime = scheduleFormData.appointment_end_datetime ? moment(scheduleFormData.appointment_end_datetime).format('HH:mm:ss') : null;

            const payload = {
                patient_id: scheduleFormData.patient_id,
                doctor_id: scheduleFormData.doctor_id,
                department_id: scheduleFormData.department_id,
                reason: scheduleFormData.reason, // Ensure this matches backend expectation ('reason' or 'original_reason')
                status: scheduleFormData.status,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                end_time: endTime,
            };

            if (editingSchedule) {
                await axios.put(`${backendUrl}/api/schedules/${editingSchedule.id}`, payload, config);
                setNotification({ message: 'Schedule updated successfully!', type: 'success' });
            } else {
                await axios.post(`${backendUrl}/api/schedules`, payload, config);
                setNotification({ message: 'Schedule added successfully!', type: 'success' });
            }
            setShowScheduleFormModal(false);
            setEditingSchedule(null);
            resetScheduleFormData();
            
            // ⭐ This call will now correctly find and execute fetchSchedules
            await fetchSchedules();

        } catch (error) {
            console.error('Error submitting schedule:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save schedule.';
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };

    // Handle Delete Schedule
    const handleScheduleDelete = async () => {
        if (!editingSchedule || !window.confirm(`Are you sure you want to delete this schedule for ${editingSchedule.patient_first_name} ${editingSchedule.patient_last_name} with Dr. ${editingSchedule.doctor_first_name} ${editingSchedule.doctor_last_name}?`)) {
            return;
        }

        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            await axios.delete(`${backendUrl}/api/schedules/${editingSchedule.id}`, config);
            setNotification({ message: 'Schedule deleted successfully!', type: 'success' });
            setShowScheduleFormModal(false);
            setEditingSchedule(null);
            resetScheduleFormData();
            // Re-fetch schedules to update the list
            const response = await axios.get(`${backendUrl}/api/schedules`, config);
            setSchedules(response.data.map(s => ({
                ...s,
                appointment_start_datetime: s.appointment_start_datetime ? new Date(s.appointment_start_datetime) : null,
                appointment_end_datetime: s.appointment_end_datetime ? new Date(s.appointment_end_datetime) : null,
            })));
        } catch (error) {
            console.error('Error deleting schedule:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete schedule.';
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };



    // Handle Add/Edit Availability Submit
    const handleAvailabilitySubmit = async (e) => {
        e.preventDefault();
        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            const doctorIdToUse = user && user.role === 'doctor' ? user.id : availabilityFormData.doctor_id;

            if (editingAvailability) {
                // **Update existing availability:**
                // We're updating a single existing record.
                // The day_of_week for this record is fixed as per the existing data.
                const payload = {
                    doctor_id: doctorIdToUse,
                    // Use the original day_of_week from the existing record,
                    // as the backend expects a single integer.
                    day_of_week: editingAvailability.day_of_week,
                    start_time: availabilityFormData.start_time,
                    end_time: availabilityFormData.end_time,
                    max_patients_per_slot: availabilityFormData.max_patients_per_slot,
                    is_active: availabilityFormData.is_active,
                };
                await axios.put(`${backendUrl}/api/schedules/availability/${editingAvailability.id}`, payload, config);
                setNotification({ message: 'Availability updated successfully!', type: 'success' });

            } else {
                // **Add new availability:**
                // The form allows selecting multiple days, so we need to
                // send a separate request for each selected day.
                if (!Array.isArray(availabilityFormData.day_of_week) || availabilityFormData.day_of_week.length === 0) {
                    setNotification({ message: 'Please select at least one day of the week.', type: 'error' });
                    setSubmittingForm(false);
                    return;
                }

                // Loop through each selected day and send a separate POST request
                for (const dayId of availabilityFormData.day_of_week) {
                    const payload = {
                        doctor_id: doctorIdToUse,
                        day_of_week: dayId, // Send single day ID to backend
                        start_time: availabilityFormData.start_time,
                        end_time: availabilityFormData.end_time,
                        max_patients_per_slot: availabilityFormData.max_patients_per_slot,
                        is_active: availabilityFormData.is_active ?? true, // Default to true for new
                    };
                    await axios.post(`${backendUrl}/api/schedules/availability`, payload, config);
                }
                setNotification({ message: 'Availability added successfully for selected days!', type: 'success' });
            }

            // Close modal, reset form, and re-fetch data after successful submission
            setShowAvailabilityFormModal(false);
            setEditingAvailability(null);
            resetAvailabilityFormData();
            reFetchAvailabilities(); // Call the centralized re-fetch function

        } catch (error) {
            console.error('Error submitting availability:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save availability.';
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };



    // Handle Delete Availability
    const handleDeleteAvailability = async (idToDelete) => {
        if (!window.confirm("Are you sure you want to delete this availability?")) {
            return;
        }

        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            await axios.delete(`${backendUrl}/api/schedules/availability/${idToDelete}`, config);
            setNotification({ message: 'Availability deleted successfully!', type: 'success' });
            setShowAvailabilityFormModal(false);
            setEditingAvailability(null);
            resetAvailabilityFormData();
            // Re-fetch availabilities to update the list /availability
            const url = `${backendUrl}/api/schedules/availability`;
            const response = await axios.get(url, config);
            setAvailabilities(response.data);
        } catch (error) {
            console.error('Error deleting availability:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete availability.';
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };



    // Handlers for opening modals for editing
    const openEditScheduleModal = (schedule) => {
        setEditingSchedule(schedule);
        // ⭐ NO CHANGE NEEDED HERE if fetchSchedules is fixed, as 'schedule' will already have valid Date objects
        setScheduleFormData({
            patient_id: schedule.patient_id,
            doctor_id: schedule.doctor_id,
            department_id: schedule.department_id,
            // These will now correctly hold valid Date objects from the 'schedule' object itself
            appointment_start_datetime: schedule.appointment_start_datetime, 
            appointment_end_datetime: schedule.appointment_end_datetime,
            reason: schedule.original_reason || schedule.reason, // Use original_reason from backend
            status: schedule.status,
        });
        setShowScheduleFormModal(true);
        setNotification({ message: null, type: null }); // Clear any previous notifications
    };


    const openEditAvailabilityModal = (availability) => {
        setEditingAvailability(availability);
        setAvailabilityFormData({
            ...availability,
            day_of_week: availability.day_of_week, // Ensure this is an array of numbers
        });
        setShowAvailabilityFormModal(true);
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen text-gray-700">Loading authentication...</div>;
    }

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    // Role-based access control for schedules tab
    const canViewSchedules = user && ['admin', 'doctor', 'receptionist', 'nurse'].includes(user.role);
    const canManageSchedules = user && ['admin', 'receptionist'].includes(user.role); // Doctors can view, but receptionists/admin manage

    // Role-based access control for availability tab
    const canViewAvailability = user && ['admin', 'doctor', 'receptionist'].includes(user.role);
    const canManageAvailability = user && ['admin', 'doctor'].includes(user.role);


    return (
        <motion.div
            className='p-6 bg-gray-50 min-h-[calc(100vh-64px)]'
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants} 
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

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule Management</h1>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {canViewSchedules && (
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'schedules' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                        Schedules (Appointments)
                    </button>
                )}
                {canViewAvailability && (
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'availability' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                        Doctor Availability
                    </button>
                )}
            </div>

            {/* Content for Schedules Tab */}
            {activeTab === 'schedules' && canViewSchedules && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700">All Appointments</h2>
                        {canManageSchedules && (
                            <motion.button
                                onClick={() => { setShowScheduleFormModal(true); setEditingSchedule(null); resetScheduleFormData(); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5" /> Add New Schedule
                            </motion.button>
                        )}
                    </div>

                    {schedules.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No schedules found. Add a new one to get started!</p>
                    ) : (
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Patient
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Doctor
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Start Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                End Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reason
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            {canManageSchedules && (
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {schedules.map((schedule) => (
                                            <motion.tr
                                                key={schedule.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {schedule.patient_first_name} {schedule.patient_last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    Dr. {schedule.doctor_first_name} {schedule.doctor_last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {/* ⭐ Use schedule.department_name from backend once available, otherwise provide fallback */}
                                                    {schedule.department_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {/* ⭐ Combine appointment_date and appointment_time */}
                                                    {schedule.appointment_date && schedule.appointment_time
                                                        ? moment(`${moment(schedule.appointment_date).format('YYYY-MM-DD')} ${schedule.appointment_time}`).format('MMM Do, YYYY h:mm A')
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {/* ⭐ Combine appointment_date with end_time */}
                                                    {schedule.appointment_date && schedule.end_time
                                                        ? moment(`${moment(schedule.appointment_date).format('YYYY-MM-DD')} ${schedule.end_time}`).format('MMM Do, YYYY h:mm A')
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                    {schedule.original_reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        schedule.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                        schedule.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        schedule.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        schedule.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {schedule.status}
                                                    </span>
                                                </td>
                                                {canManageSchedules && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <motion.button
                                                                onClick={() => openEditScheduleModal(schedule)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit Schedule"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content for Availability Tab */}
            {activeTab === 'availability' && canViewAvailability && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700">Doctor Availability Slots</h2>
                        {canManageAvailability && (
                            <motion.button
                                onClick={() => { setShowAvailabilityFormModal(true); setEditingAvailability(null); resetAvailabilityFormData(); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5" /> Add New Availability
                            </motion.button>
                        )}
                    </div>

                    {availabilities.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No availability slots found. Add new slots for doctors!</p>
                    ) : (
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Doctor
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Day(s) of Week
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time Slot
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Max Patients/Slot
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            {canManageAvailability && (
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {availabilities.map((availability) => (
                                            <motion.tr
                                                key={availability.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Dr. {doctors.find(d => d.id === availability.doctor_id)?.first_name}{' '}
                                                    {doctors.find(d => d.id === availability.doctor_id)?.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {daysOfWeek.find(d => d.id === availability.day_of_week)?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {availability.start_time} - {availability.end_time}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {availability.max_patients_per_slot}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        availability.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {availability.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                {canManageAvailability && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <motion.button
                                                                onClick={() => openEditAvailabilityModal(availability)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit Availability"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </motion.button>
                                                            <motion.button
                                                                onClick={() => handleDeleteAvailability(availability.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Availability"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Schedule Form Modal */}
            <Modal
                isOpen={showScheduleFormModal}
                onRequestClose={() => { setShowScheduleFormModal(false); setEditingSchedule(null); resetScheduleFormData(); }}
                contentLabel={editingSchedule ? "Edit Schedule" : "Add Schedule"}
                className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[99]"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-auto my-8 border border-gray-200"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {editingSchedule ? 'Edit Schedule (Appointment)' : 'Add New Schedule (Appointment)'}
                    </h2>
                    <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Patient Selection (NEW) */}
                        <div>
                            <label htmlFor="schedule_patient_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Patient <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="schedule_patient_id"
                                name="patient_id"
                                value={scheduleFormData.patient_id}
                                onChange={handleScheduleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Select Patient</option>
                                {/* Ensure 'patients' array is fetched and available in state */}
                                {Array.isArray(patients) && patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.first_name} {patient.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Doctor Selection */}
                        <div>
                            <label htmlFor="schedule_doctor_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Doctor <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="schedule_doctor_id"
                                name="doctor_id"
                                value={scheduleFormData.doctor_id}
                                onChange={handleScheduleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                                disabled={user && user.role === 'doctor'} // Doctors can't change this
                            >
                                <option value="">Select Doctor</option>
                                {Array.isArray(doctors) && doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.first_name} {doctor.last_name} ({doctor.username})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Department Selection */}
                        <div>
                            <label htmlFor="schedule_department_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="schedule_department_id"
                                name="department_id"
                                value={scheduleFormData.department_id}
                                onChange={handleScheduleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Select Department</option>
                                {Array.isArray(departments) && departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date & Time (using DatePicker) */}
                        <div>
                            <label htmlFor="scheduleStartDateTime" className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time <span className="text-red-500">*</span></label>
                            <DatePicker
                                selected={scheduleFormData.appointment_start_datetime}
                                onChange={(date) => handleScheduleDateTimeChange(date, 'appointment_start_datetime')}
                                showTimeSelect
                                dateFormat="Pp"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                placeholderText="Select start date and time"
                                required
                            />
                        </div>

                        {/* End Date & Time (using DatePicker) */}
                        <div>
                            <label htmlFor="scheduleEndDateTime" className="block text-sm font-medium text-gray-700 mb-1">End Date & Time <span className="text-red-500">*</span></label>
                            <DatePicker
                                selected={scheduleFormData.appointment_end_datetime}
                                onChange={(date) => handleScheduleDateTimeChange(date, 'appointment_end_datetime')}
                                showTimeSelect
                                dateFormat="Pp"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                placeholderText="Select end date and time"
                                required
                            />
                        </div>

                        {/* Reason */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Appointment: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={scheduleFormData.reason}
                                onChange={handleScheduleInputChange}
                                rows="3"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status: <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={scheduleFormData.status}
                                onChange={handleScheduleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="No Show">No Show</option>
                            </select>
                        </div>
                        {/* Empty div for layout if needed, or remove if other field balances it */}
                        <div></div>

                        {/* Action Buttons */}
                        <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-6">
                            {editingSchedule && (
                                <button
                                    type="button"
                                    onClick={handleScheduleDelete}
                                    disabled={submittingForm}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {submittingForm && editingSchedule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Delete
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => { setShowScheduleFormModal(false); setEditingSchedule(null); resetScheduleFormData(); }}
                                disabled={submittingForm}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingForm}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Modal>

            {/* Availability Form Modal */}
            <Modal
                isOpen={showAvailabilityFormModal}
                onRequestClose={() => { setShowAvailabilityFormModal(false); setEditingAvailability(null); resetAvailabilityFormData(); }}
                contentLabel={editingAvailability ? "Edit Doctor Availability" : "Add Doctor Availability"}
                className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[99]"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-auto my-8 border border-gray-200"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {editingAvailability ? 'Edit Doctor Availability' : 'Add New Doctor Availability'}
                    </h2>
                    <form onSubmit={handleAvailabilitySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Doctor Selection (Admin only) */}
                        {(user && user.role === 'admin' && !editingAvailability) && (
                            <div>
                                <label htmlFor="availability_doctor_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="availability_doctor_id"
                                    name="doctor_id"
                                    value={availabilityFormData.doctor_id}
                                    onChange={handleAvailabilityInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    {Array.isArray(doctors) && doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.first_name} {doctor.last_name} ({doctor.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {/* Display Doctor Name for non-admin/editing mode if doctor_id is set */}
                        {((user && user.role === 'doctor' && user.id === availabilityFormData.doctor_id) || (editingAvailability && doctors.find(d => d.id === availabilityFormData.doctor_id))) && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor
                                </label>
                                <p className="mt-1 p-2 bg-gray-100 rounded-md text-gray-700">
                                    {doctors.find(d => d.id === availabilityFormData.doctor_id)?.first_name}{' '}
                                    {doctors.find(d => d.id === availabilityFormData.doctor_id)?.last_name}
                                </p>
                            </div>
                        )}

                        {/* Day of Week Multi-select */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Day(s) of Week <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Array.isArray(daysOfWeek) && daysOfWeek.map(day => (
                                    <label key={day.id} className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="day_of_week"
                                            value={day.id}
                                            checked={
                                                Array.isArray(availabilityFormData.day_of_week) &&
                                                availabilityFormData.day_of_week.includes(day.id)
                                            }
                                            onChange={handleAvailabilityInputChange}
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                            disabled={!!editingAvailability}
                                        />
                                        <span className="ml-2 text-gray-700">{day.name}</span>
                                    </label>
                                ))}
                            </div>
                            {editingAvailability && (
                                <p className="text-xs text-gray-500 mt-2">To change the day, please delete and re-add this availability.</p>
                            )}
                        </div>

                        {/* Start Time */}
                        <div>
                            <label htmlFor="availability_start_time" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="availability_start_time"
                                name="start_time"
                                value={availabilityFormData.start_time}
                                onChange={handleAvailabilityInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label htmlFor="availability_end_time" className="block text-sm font-medium text-gray-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="availability_end_time"
                                name="end_time"
                                value={availabilityFormData.end_time}
                                onChange={handleAvailabilityInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        {/* Max Patients per Slot */}
                        <div className="md:col-span-1">
                            <label htmlFor="max_patients_per_slot" className="block text-sm font-medium text-gray-700 mb-1">
                                Max Patients per Slot <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="max_patients_per_slot"
                                name="max_patients_per_slot"
                                value={availabilityFormData.max_patients_per_slot}
                                onChange={handleAvailabilityInputChange}
                                min="1"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        {/* Is Active Toggle */}
                        <div className="md:col-span-1 flex items-center mt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={availabilityFormData.is_active}
                                onChange={handleAvailabilityInputChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                                Set as Active
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-6">
                            {editingAvailability && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteAvailability(editingAvailability.id)}
                                    disabled={submittingForm}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Delete
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => { setShowAvailabilityFormModal(false); setEditingAvailability(null); resetAvailabilityFormData(); }}
                                disabled={submittingForm}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingForm}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingAvailability ? 'Update Availability' : 'Add Availability'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Modal>
        </motion.div>
    );
}

export default ScheduleManagementPage;