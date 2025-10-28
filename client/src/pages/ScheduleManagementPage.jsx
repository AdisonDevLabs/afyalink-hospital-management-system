// frontend/src/pages/ScheduleManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
    const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
    const textColor = type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: "50%" }}
            animate={{ opacity: 1, y: 0, x: "0%" }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg dark:shadow-xl flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-l-4 transition-colors duration-300`}
            role="alert"
        >
            {type === 'success' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <div>{message}</div>
            <button onClick={onClose} className={`ml-auto ${type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'} hover:opacity-75`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </motion.div>
    );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function ScheduleManagementPage() {
    const { user, loading: authLoading, isAuthenticated, getApiPrefix } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('schedules');
    const [notification, setNotification] = useState({ message: null, type: null });
    const [submittingForm, setSubmittingForm] = useState(false);

    const [schedules, setSchedules] = useState([]);
    const [showScheduleFormModal, setShowScheduleFormModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [scheduleFormData, setScheduleFormData] = useState({
        patient_id: '', doctor_id: user?.role === 'doctor' ? user.id : '', department_id: '',
        appointment_start_datetime: null, appointment_end_datetime: null, reason: '', status: 'Scheduled',
    });

    const [availabilities, setAvailabilities] = useState([]);
    const [showAvailabilityFormModal, setShowAvailabilityFormModal] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [availabilityFormData, setAvailabilityFormData] = useState({
        doctor_id: user?.role === 'doctor' ? user.id : '', day_of_week: [], start_time: '', end_time: '',
        max_patients_per_slot: 1, is_active: true,
    });

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [patients, setPatients] = useState([]);

    const daysOfWeek = useMemo(() => [
        { id: 0, name: 'Sunday' }, { id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' }, { id: 4, name: 'Thursday' }, { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
    ], []);

    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
    }), []);

    const resetScheduleFormData = useCallback(() => {
        setScheduleFormData({
            patient_id: '', doctor_id: user?.role === 'doctor' ? user.id : '', department_id: '',
            appointment_start_datetime: null, appointment_end_datetime: null, reason: '', status: 'Scheduled',
        });
        setNotification({ message: null, type: null });
    }, [user]);

    const resetAvailabilityFormData = useCallback(() => {
        setAvailabilityFormData({
            doctor_id: user?.role === 'doctor' ? user.id : '', day_of_week: [], start_time: '', end_time: '',
            max_patients_per_slot: 1, is_active: true,
        });
        setNotification({ message: null, type: null });
    }, [user]);

    const handleScheduleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setScheduleFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleScheduleDateTimeChange = useCallback((date, fieldName) => {
        setScheduleFormData(prev => ({ ...prev, [fieldName]: date }));
    }, []);

    const handleAvailabilityInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'day_of_week') {
            const dayId = parseInt(value);
            setAvailabilityFormData(prevData => ({
                ...prevData,
                day_of_week: checked ? [...prevData.day_of_week, dayId] : prevData.day_of_week.filter(day => day !== dayId),
            }));
        } else if (type === 'checkbox') {
            setAvailabilityFormData(prevData => ({ ...prevData, [name]: checked }));
        } else if (type === 'number') {
            setAvailabilityFormData(prevData => ({ ...prevData, [name]: value === '' ? '' : Number(value) }));
        } else {
            setAvailabilityFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const fetchData = useCallback(async (url, setter, errorMessage) => {
        if (!isAuthenticated || authLoading) return;
        try {
            const response = await axios.get(url, config);
            setter(response.data.patients || response.data); // Adjust for 'patients' key
        } catch (error) {
            console.error(`Error ${errorMessage}:`, error);
            setNotification({ message: `Failed to ${errorMessage}.`, type: 'error' });
        }
    }, [isAuthenticated, authLoading, config]);

    const fetchSchedules = useCallback(async () => {
        if (!isAuthenticated || authLoading) return;
        try {
            const response = await axios.get(`${backendUrl}${getApiPrefix()}/schedules`, config);
            setSchedules(response.data.map(s => ({
                ...s,
                appointment_start_datetime: s.appointment_date && s.appointment_time ? moment(`${moment(s.appointment_date).format('YYYY-MM-DD')} ${s.appointment_time}`).toDate() : null,
                appointment_end_datetime: s.appointment_date && s.end_time ? moment(`${moment(s.appointment_date).format('YYYY-MM-DD')} ${s.end_time}`).toDate() : null,
            })));
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setNotification({ message: 'Failed to fetch schedules.', type: 'error' });
        }
    }, [isAuthenticated, authLoading, config]);

    useEffect(() => {
        if (!isAuthenticated || authLoading) return;
        fetchData(`${backendUrl}${getApiPrefix()}/users?role=doctor`, setDoctors, 'fetching doctors');
        fetchData(`${backendUrl}${getApiPrefix()}/departments`, setDepartments, 'fetching departments');
        fetchData(`${backendUrl}${getApiPrefix()}/patients`, setPatients, 'fetching patients');
        fetchSchedules();
        fetchData(`${backendUrl}${getApiPrefix()}/schedules/availability`, setAvailabilities, 'fetching availabilities');
    }, [isAuthenticated, authLoading, fetchData, fetchSchedules]);

    useEffect(() => {
        if (editingAvailability) {
            setAvailabilityFormData({
                doctor_id: editingAvailability.doctor_id,
                day_of_week: Array.isArray(editingAvailability.day_of_week) ? editingAvailability.day_of_week : [editingAvailability.day_of_week],
                start_time: editingAvailability.start_time, end_time: editingAvailability.end_time,
                max_patients_per_slot: editingAvailability.max_patients_per_slot || 1, is_active: editingAvailability.is_active ?? true,
            });
            setShowAvailabilityFormModal(true);
        } else {
            resetAvailabilityFormData();
        }
    }, [editingAvailability, resetAvailabilityFormData]);

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        try {
            const payload = {
                ...scheduleFormData,
                appointment_date: scheduleFormData.appointment_start_datetime ? moment(scheduleFormData.appointment_start_datetime).format('YYYY-MM-DD') : null,
                appointment_time: scheduleFormData.appointment_start_datetime ? moment(scheduleFormData.appointment_start_datetime).format('HH:mm:ss') : null,
                end_time: scheduleFormData.appointment_end_datetime ? moment(scheduleFormData.appointment_end_datetime).format('HH:mm:ss') : null,
            };
            delete payload.appointment_start_datetime; // Remove Date objects before sending
            delete payload.appointment_end_datetime;

            const url = editingSchedule ? `${backendUrl}${getApiPrefix()}/schedules/${editingSchedule.id}` : `${backendUrl}${getApiPrefix()}/schedules`;
            const method = editingSchedule ? axios.put : axios.post;
            await method(url, payload, config);

            setNotification({ message: `Schedule ${editingSchedule ? 'updated' : 'added'} successfully!`, type: 'success' });
            setShowScheduleFormModal(false);
            setEditingSchedule(null);
            resetScheduleFormData();
            fetchSchedules();
        } catch (error) {
            console.error('Error submitting schedule:', error);
            setNotification({ message: error.response?.data?.message || 'Failed to save schedule.', type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleScheduleDelete = async () => {
        if (!editingSchedule || !window.confirm(`Are you sure you want to delete this schedule for ${editingSchedule.patient_first_name} ${editingSchedule.patient_last_name} with Dr. ${editingSchedule.doctor_first_name} ${editingSchedule.doctor_last_name}?`)) {
            return;
        }
        setSubmittingForm(true);
        setNotification({ message: null, type: null });
        try {
            await axios.delete(`${backendUrl}${getApiPrefix()}/schedules/${editingSchedule.id}`, config);
            setNotification({ message: 'Schedule deleted successfully!', type: 'success' });
            setShowScheduleFormModal(false);
            setEditingSchedule(null);
            resetScheduleFormData();
            fetchSchedules(); // Re-fetch schedules
        } catch (error) {
            console.error('Error deleting schedule:', error);
            setNotification({ message: error.response?.data?.message || 'Failed to delete schedule.', type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleAvailabilitySubmit = async (e) => {
        e.preventDefault();
        setSubmittingForm(true);
        setNotification({ message: null, type: null });

        try {
            const doctorIdToUse = user?.role === 'doctor' ? user.id : availabilityFormData.doctor_id;

            if (editingAvailability) {
                const payload = {
                    doctor_id: doctorIdToUse, day_of_week: editingAvailability.day_of_week,
                    start_time: availabilityFormData.start_time, end_time: availabilityFormData.end_time,
                    max_patients_per_slot: availabilityFormData.max_patients_per_slot, is_active: availabilityFormData.is_active,
                };
                await axios.put(`${backendUrl}${getApiPrefix()}/schedules/availability/${editingAvailability.id}`, payload, config);
                setNotification({ message: 'Availability updated successfully!', type: 'success' });
            } else {
                if (!Array.isArray(availabilityFormData.day_of_week) || availabilityFormData.day_of_week.length === 0) {
                    setNotification({ message: 'Please select at least one day of the week.', type: 'error' });
                    setSubmittingForm(false);
                    return;
                }
                for (const dayId of availabilityFormData.day_of_week) {
                    const payload = {
                        doctor_id: doctorIdToUse, day_of_week: dayId,
                        start_time: availabilityFormData.start_time, end_time: availabilityFormData.end_time,
                        max_patients_per_slot: availabilityFormData.max_patients_per_slot, is_active: availabilityFormData.is_active ?? true,
                    };
                    await axios.post(`${backendUrl}${getApiPrefix()}/schedules/availability`, payload, config);
                }
                setNotification({ message: 'Availability added successfully for selected days!', type: 'success' });
            }
            setShowAvailabilityFormModal(false);
            setEditingAvailability(null);
            resetAvailabilityFormData();
            fetchData(`${backendUrl}${getApiPrefix()}/schedules/availability`, setAvailabilities, 're-fetching availabilities');
        } catch (error) {
            console.error('Error submitting availability:', error);
            setNotification({ message: error.response?.data?.message || 'Failed to save availability.', type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleDeleteAvailability = async (idToDelete) => {
        if (!window.confirm("Are you sure you want to delete this availability?")) return;
        setSubmittingForm(true);
        setNotification({ message: null, type: null });
        try {
            await axios.delete(`${backendUrl}${getApiPrefix()}/schedules/availability/${idToDelete}`, config);
            setNotification({ message: 'Availability deleted successfully!', type: 'success' });
            setShowAvailabilityFormModal(false);
            setEditingAvailability(null);
            resetAvailabilityFormData();
            fetchData(`${backendUrl}${getApiPrefix()}/schedules/availability`, setAvailabilities, 're-fetching availabilities');
        } catch (error) {
            console.error('Error deleting availability:', error);
            setNotification({ message: error.response?.data?.message || 'Failed to delete availability.', type: 'error' });
        } finally {
            setSubmittingForm(false);
        }
    };

    const openEditScheduleModal = (schedule) => {
        setEditingSchedule(schedule);
        setScheduleFormData({
            patient_id: schedule.patient_id, doctor_id: schedule.doctor_id, department_id: schedule.department_id,
            appointment_start_datetime: schedule.appointment_start_datetime, appointment_end_datetime: schedule.appointment_end_datetime,
            reason: schedule.original_reason || schedule.reason, status: schedule.status,
        });
        setShowScheduleFormModal(true);
        setNotification({ message: null, type: null });
    };

    const openEditAvailabilityModal = (availability) => {
        setEditingAvailability(availability);
        setAvailabilityFormData({ ...availability, day_of_week: availability.day_of_week });
        setShowAvailabilityFormModal(true);
    };

    if (authLoading) return <div className="flex justify-center items-center h-screen text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">Loading authentication...</div>;
    if (!isAuthenticated) { navigate('/login'); return null; }

    const canViewSchedules = user && ['admin', 'doctor', 'receptionist', 'nurse'].includes(user.role);
    const canManageSchedules = user && ['admin', 'receptionist'].includes(user.role);
    const canViewAvailability = user && ['admin', 'doctor', 'receptionist'].includes(user.role);
    const canManageAvailability = user && ['admin', 'doctor'].includes(user.role);

    return (
        <motion.div className='p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] transition-colors duration-300' initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <AnimatePresence>{notification.message && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: null, type: null })} />}</AnimatePresence>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-300">Schedule Management</h1>

            <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                {canViewSchedules && (<button onClick={() => setActiveTab('schedules')} className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${activeTab === 'schedules' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'}`}>Schedules (Appointments)</button>)}
                {canViewAvailability && (<button onClick={() => setActiveTab('availability')} className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${activeTab === 'availability' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'}`}>Doctor Availability</button>)}
            </div>

            {activeTab === 'schedules' && canViewSchedules && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">All Appointments</h2>
                        {canManageSchedules && (
                            <motion.button onClick={() => { setShowScheduleFormModal(true); setEditingSchedule(null); resetScheduleFormData(); }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <PlusCircle className="mr-2 h-5 w-5" /> Add New Schedule
                            </motion.button>
                        )}
                    </div>
                    {schedules.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No schedules found. Add a new one to get started!</p>) : (
                        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg overflow-hidden transition-colors duration-300">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {['Patient', 'Doctor', 'Department', 'Start Time', 'End Time', 'Reason', 'Status'].map(header => (
                                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                            ))}
                                            {canManageSchedules && (<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {schedules.map(schedule => (
                                            <motion.tr key={schedule.id} variants={itemVariants} initial="hidden" animate="visible" className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{schedule.patient_first_name} {schedule.patient_last_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Dr. {schedule.doctor_first_name} {schedule.doctor_last_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{schedule.department_name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {schedule.appointment_date && schedule.appointment_time ? moment(`${moment(schedule.appointment_date).format('YYYY-MM-DD')} ${schedule.appointment_time}`).format('MMM Do, YYYY h:mm A') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {schedule.appointment_date && schedule.end_time ? moment(`${moment(schedule.appointment_date).format('YYYY-MM-DD')} ${schedule.end_time}`).format('MMM Do, YYYY h:mm A') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{schedule.original_reason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        schedule.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                                        schedule.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                                        schedule.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                                                        schedule.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                                    } transition-colors duration-300`}>{schedule.status}</span>
                                                </td>
                                                {canManageSchedules && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <motion.button onClick={() => openEditScheduleModal(schedule)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300" title="Edit Schedule" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Edit className="h-5 w-5" /></motion.button>
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

            {activeTab === 'availability' && canViewAvailability && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">Doctor Availability Slots</h2>
                        {canManageAvailability && (
                            <motion.button onClick={() => { setShowAvailabilityFormModal(true); setEditingAvailability(null); resetAvailabilityFormData(); }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <PlusCircle className="mr-2 h-5 w-5" /> Add New Availability
                            </motion.button>
                        )}
                    </div>
                    {availabilities.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No availability slots found. Add new slots for doctors!</p>) : (
                        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg overflow-hidden transition-colors duration-300">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {['Doctor', 'Day(s) of Week', 'Time Slot', 'Max Patients/Slot', 'Status'].map(header => (
                                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                            ))}
                                            {canManageAvailability && (<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {availabilities.map(availability => (
                                            <motion.tr key={availability.id} variants={itemVariants} initial="hidden" animate="visible" className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Dr. {doctors.find(d => d.id === availability.doctor_id)?.first_name}{' '}
                                                    {doctors.find(d => d.id === availability.doctor_id)?.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {daysOfWeek.find(d => d.id === availability.day_of_week)?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{availability.start_time} - {availability.end_time}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{availability.max_patients_per_slot}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        availability.is_active ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                                                    } transition-colors duration-300`}>
                                                        {availability.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                {canManageAvailability && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <motion.button onClick={() => openEditAvailabilityModal(availability)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300" title="Edit Availability" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Edit className="h-5 w-5" /></motion.button>
                                                            <motion.button onClick={() => handleDeleteAvailability(availability.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300" title="Delete Availability" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Trash2 className="h-5 w-5" /></motion.button>
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
            <Modal isOpen={showScheduleFormModal} onRequestClose={() => { setShowScheduleFormModal(false); setEditingSchedule(null); resetScheduleFormData(); }} contentLabel={editingSchedule ? "Edit Schedule" : "Add Schedule"} className="fixed inset-0 flex items-center justify-center p-4 z-[100]" overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[99]">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-xl p-8 max-w-2xl w-full mx-auto my-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">
                        {editingSchedule ? 'Edit Schedule (Appointment)' : 'Add New Schedule (Appointment)'}
                    </h2>
                    <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="schedule_patient_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Patient <span className="text-red-500">*</span></label>
                            <select id="schedule_patient_id" name="patient_id" value={scheduleFormData.patient_id} onChange={handleScheduleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required>
                                <option value="">Select Patient</option>
                                {Array.isArray(patients) && patients.map(patient => (<option key={patient.id} value={patient.id}>{patient.first_name} {patient.last_name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="schedule_doctor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Doctor <span className="text-red-500">*</span></label>
                            <select id="schedule_doctor_id" name="doctor_id" value={scheduleFormData.doctor_id} onChange={handleScheduleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400" required disabled={user?.role === 'doctor'}>
                                <option value="">Select Doctor</option>
                                {Array.isArray(doctors) && doctors.map(doctor => (<option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.last_name} ({doctor.username})</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="schedule_department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Department <span className="text-red-500">*</span></label>
                            <select id="schedule_department_id" name="department_id" value={scheduleFormData.department_id} onChange={handleScheduleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required>
                                <option value="">Select Department</option>
                                {Array.isArray(departments) && departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="scheduleStartDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Start Date & Time <span className="text-red-500">*</span></label>
                            <DatePicker selected={scheduleFormData.appointment_start_datetime} onChange={(date) => handleScheduleDateTimeChange(date, 'appointment_start_datetime')} showTimeSelect dateFormat="Pp" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-300" placeholderText="Select start date and time" required />
                        </div>
                        <div>
                            <label htmlFor="scheduleEndDateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">End Date & Time <span className="text-red-500">*</span></label>
                            <DatePicker selected={scheduleFormData.appointment_end_datetime} onChange={(date) => handleScheduleDateTimeChange(date, 'appointment_end_datetime')} showTimeSelect dateFormat="Pp" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-300" placeholderText="Select end date and time" required />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Reason for Appointment: <span className="text-red-500">*</span></label>
                            <textarea id="reason" name="reason" value={scheduleFormData.reason} onChange={handleScheduleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Status: <span className="text-red-500">*</span></label>
                            <select id="status" name="status" value={scheduleFormData.status} onChange={handleScheduleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required>
                                <option value="">Select Status</option>
                                {['Scheduled', 'Completed', 'Confirmed', 'Cancelled', 'Rescheduled', 'No Show'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div></div>
                        <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-6">
                            {editingSchedule && (<button type="button" onClick={handleScheduleDelete} disabled={submittingForm} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                {submittingForm && editingSchedule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                            </button>)}
                            <button type="button" onClick={() => { setShowScheduleFormModal(false); setEditingSchedule(null); resetScheduleFormData(); }} disabled={submittingForm} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                            <button type="submit" disabled={submittingForm} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Modal>

            {/* Availability Form Modal */}
            <Modal isOpen={showAvailabilityFormModal} onRequestClose={() => { setShowAvailabilityFormModal(false); setEditingAvailability(null); resetAvailabilityFormData(); }} contentLabel={editingAvailability ? "Edit Doctor Availability" : "Add Doctor Availability"} className="fixed inset-0 flex items-center justify-center p-4 z-[100]" overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[99]">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-xl p-8 max-w-2xl w-full mx-auto my-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors duration-300">
                        {editingAvailability ? 'Edit Doctor Availability' : 'Add New Doctor Availability'}
                    </h2>
                    <form onSubmit={handleAvailabilitySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {(user?.role === 'admin' && !editingAvailability) && (
                            <div>
                                <label htmlFor="availability_doctor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Doctor <span className="text-red-500">*</span></label>
                                <select id="availability_doctor_id" name="doctor_id" value={availabilityFormData.doctor_id} onChange={handleAvailabilityInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required>
                                    <option value="">Select Doctor</option>
                                    {Array.isArray(doctors) && doctors.map(doctor => (<option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.last_name} ({doctor.username})</option>))}
                                </select>
                            </div>
                        )}
                        {((user?.role === 'doctor' && user?.id === availabilityFormData.doctor_id) || (editingAvailability && doctors.find(d => d.id === availabilityFormData.doctor_id))) && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Doctor</label>
                                <p className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 transition-colors duration-300">
                                    {doctors.find(d => d.id === availabilityFormData.doctor_id)?.first_name}{' '}
                                    {doctors.find(d => d.id === availabilityFormData.doctor_id)?.last_name}
                                </p>
                            </div>
                        )}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Day(s) of Week <span className="text-red-500">*</span></label>
                            <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Array.isArray(daysOfWeek) && daysOfWeek.map(day => (
                                    <label key={day.id} className="inline-flex items-center">
                                        <input type="checkbox" name="day_of_week" value={day.id} checked={Array.isArray(availabilityFormData.day_of_week) && availabilityFormData.day_of_week.includes(day.id)} onChange={handleAvailabilityInputChange} className="form-checkbox h-5 w-5 text-blue-600 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 dark:checked:border-blue-500 transition-colors duration-300" disabled={!!editingAvailability} />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">{day.name}</span>
                                    </label>
                                ))}
                            </div>
                            {editingAvailability && (<p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">To change the day, please delete and re-add this availability.</p>)}
                        </div>
                        <div>
                            <label htmlFor="availability_start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Start Time <span className="text-red-500">*</span></label>
                            <input type="time" id="availability_start_time" name="start_time" value={availabilityFormData.start_time} onChange={handleAvailabilityInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required />
                        </div>
                        <div>
                            <label htmlFor="availability_end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">End Time <span className="text-red-500">*</span></label>
                            <input type="time" id="availability_end_time" name="end_time" value={availabilityFormData.end_time} onChange={handleAvailabilityInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="max_patients_per_slot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Max Patients per Slot <span className="text-red-500">*</span></label>
                            <input type="number" id="max_patients_per_slot" name="max_patients_per_slot" value={availabilityFormData.max_patients_per_slot} onChange={handleAvailabilityInputChange} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300" required />
                        </div>
                        <div className="md:col-span-1 flex items-center mt-6">
                            <input type="checkbox" id="is_active" name="is_active" checked={availabilityFormData.is_active} onChange={handleAvailabilityInputChange} className="form-checkbox h-5 w-5 text-blue-600 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-500 dark:checked:border-blue-500 transition-colors duration-300" />
                            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Set as Active</label>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-6">
                            {editingAvailability && (<button type="button" onClick={() => handleDeleteAvailability(editingAvailability.id)} disabled={submittingForm} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                            </button>)}
                            <button type="button" onClick={() => { setShowAvailabilityFormModal(false); setEditingAvailability(null); resetAvailabilityFormData(); }} disabled={submittingForm} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                            <button type="submit" disabled={submittingForm} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                {submittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {editingAvailability ? 'Update Availability' : 'Add Availability'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Modal>
        </motion.div>
    );
}

export default ScheduleManagementPage;