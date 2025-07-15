// frontend/src/pages/DoctorDashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, CalendarCheck, FileText, MessageSquareText,
    Bed, Clock, ClipboardList, Stethoscope, BriefcaseMedical, CalendarPlus, BellRing,
    Search, PlusCircle, History, AlertTriangle, MessageSquareMore, BarChart, TrendingUp, Handshake, Loader2
} from 'lucide-react'; // Expanded and refined icon set

// --- Reusable Notification Component (as provided, ensuring consistency) ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
    const borderColor = type === 'success' ? 'border-green-400' : type === 'error' ? 'border-red-400' : 'border-blue-400';
    const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
    const iconColor = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-6 right-6 z-[1000] p-4 rounded-lg shadow-xl flex items-center space-x-3
                        ${bgColor} ${borderColor} ${textColor} border-l-4 pr-10 min-w-[300px] max-w-sm`}
            role="alert"
        >
            {type === 'success' && <CalendarCheck className={`h-6 w-6 ${iconColor}`} />}
            {type === 'error' && <BellRing className={`h-6 w-6 ${iconColor}`} />}
            {type === 'info' && <BriefcaseMedical className={`h-6 w-6 ${iconColor}`} />}
            <div className="flex-grow">{message}</div>
            <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                <span className="sr-only">Close alert</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </motion.div>
    );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

function DoctorDashboardPage() {
    const { user, isAuthenticated, loading: authLoading, token } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        todayAppointmentsCount: 0,
        upcomingAppointments: [],
        pendingLabReports: [],
        admittedPatients: [],
        criticalAlerts: [],
        recentActivities: [],
        patientCount: 0,
        availableSlotsToday: 0, // Placeholder, ideally calculated dynamically
        unreadMessages: [], // New: Separate from critical alertsbackendUrl
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: null, type: null });

  //  const backendUrl = '/api/';

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: null, type: null }), 5000);
    };

    const fetchDashboardData = useCallback(async () => {
        if (!token || !user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const today = new Date();
            const todayDateString = today.toISOString().split('T')[0];

            const [
                todaysAppointmentsRes,
                allAppointmentsRes,
                labReportsRes,
                admittedPatientsRes,
                criticalAlertsRes,
                patientCountRes,
                recentActivitiesRes,
                unreadMessagesRes // New API call
            ] = await Promise.all([
                fetch(`${backendUrl}/api/appointments?doctor_id=${user.id}&date=${todayDateString}&status=Scheduled`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/appointments?doctor_id=${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/lab-reports?doctor_id=${user.id}&status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/patients?admitted_by=${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/alerts/by-user?recipient_id=${user.id}&severity=critical`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/patients/count?doctor_id=${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/doctor-activities?doctor_id=${user.id}&limit=5`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${backendUrl}/api/messages?recipient_id=${user.id}&status=unread`, { headers: { 'Authorization': `Bearer ${token}` } }), // Fetch unread messages
            ]);

            const responses = [
                todaysAppointmentsRes, allAppointmentsRes, labReportsRes,
                admittedPatientsRes, criticalAlertsRes, patientCountRes, recentActivitiesRes,
                unreadMessagesRes
            ];

            for (const res of responses) {
                if (!res.ok) throw new Error(`Failed to fetch ${res.url.split('?')[0].split('/').pop()}: ${res.statusText}`);
            }

            const [
                todaysAppointmentsData,
                allAppointmentsData,
                labReportsData,
                admittedPatientsData,
                criticalAlertsData,
                patientCountData,
                recentActivitiesData,
                unreadMessagesData
            ] = await Promise.all(responses.map(res => res.json()));

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const upcoming = allAppointmentsData.filter(app => {
                const appointmentDate = new Date(app.appointment_date);
                appointmentDate.setHours(0, 0, 0, 0);
                return appointmentDate > now;
            }).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

            // Dummy calculation for available slots
            const totalSlotsToday = 10;
            const bookedSlotsToday = todaysAppointmentsData.length;
            const availableSlots = totalSlotsToday - bookedSlotsToday;

            setDashboardData({
                todayAppointmentsCount: todaysAppointmentsData.length,
                upcomingAppointments: upcoming,
                pendingLabReports: labReportsData,
                admittedPatients: admittedPatientsData.patients || [],
                criticalAlerts: criticalAlertsData.alerts || [],
                patientCount: patientCountData.count !== undefined ? patientCountData.count : 0,
                recentActivities: recentActivitiesData.activities || [],
                availableSlotsToday: availableSlots > 0 ? availableSlots : 0,
                unreadMessages: unreadMessagesData.messages || [], // Adjust access based on actual API response structure
            });

        } catch (err) {
            console.error('Error fetching doctor dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data. Check your network or server.');
            showNotification('Failed to load dashboard data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, user?.id, backendUrl]);

    useEffect(() => {
        if (!authLoading && isAuthenticated && user && user.role === 'doctor') {
            fetchDashboardData();
        } else if (!authLoading && (!isAuthenticated || user.role !== 'doctor')) {
            showNotification('You are not authorized to view this page.', 'error');
            navigate('/unauthorized');
        }
    }, [authLoading, isAuthenticated, user, navigate, fetchDashboardData]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const cardHoverVariants = {
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            transition: {
                duration: 0.2
            }
        }
    };

    // Main loading state
    if (authLoading || loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-700">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <p className="mt-4 text-xl font-medium">Loading your secure dashboard...</p>
                <p className="mt-2 text-md text-gray-500">Please wait while we fetch your data.</p>
            </div>
        );
    }

    // Unauthorized access handling
    if (!isAuthenticated || user.role !== 'doctor') {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-800">
                <AlertTriangle className="h-20 w-20 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-lg text-center">You must be logged in as a doctor to view this page.</p>
                <Link to="/login" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800"
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

            {/* Header with Welcome and Quick Actions */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <Stethoscope className="h-10 w-10 text-blue-600 mr-3" />
                        Physician's Overview
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">Welcome, Dr. {user?.username || 'Physician'} Here's your daily summary for AfyaLink HMS.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/patients/" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        <Search className="h-5 w-5 mr-2" /> Find Patient
                    </Link>
                    <Link to="/profile" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        <User className="h-5 w-5 mr-2" /> My Profile
                    </Link>
                </div>
            </header>

            {error && (
                <motion.div
                    className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6 shadow-sm"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <strong className="font-bold mr-2">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                </motion.div>
            )}

            {/* A. Key Metrics / Quick Glance Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Today's Appointments */}
                <div variants={itemVariants} whileHover="hover" className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">Today's Appointments</h3>
                        <CalendarCheck className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-5xl font-bold text-gray-900">{dashboardData.todayAppointmentsCount}</p>
                    <p className="text-sm text-gray-500 mt-1">Scheduled for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <Link to="/appointments?date=today" className="text-blue-600 hover:underline text-sm mt-3 inline-block">View Details &rarr;</Link>
                </div>

                {/* Pending Lab 5000 Reports */}
                <motion.div variants={itemVariants} whileHover="hover" className="bg-white p-6 rounded-xl shadow-md border-b-4 border-yellow-500 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">Pending Lab Reports</h3>
                        <FileText className="h-8 w-8 text-yellow-500" />
                    </div>
                    <p className="text-5xl font-bold text-gray-900">{dashboardData.pendingLabReports.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting your review</p>
                    <Link to="/lab-reports?status=pending" className="text-blue-600 hover:underline text-sm mt-3 inline-block">Review Now &rarr;</Link>
                </motion.div>

                {/* Admitted Patients */}
                <motion.div variants={itemVariants} whileHover="hover" className="bg-white p-6 rounded-xl shadow-md border-b-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">My Admitted Patients</h3>
                        <Bed className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-5xl font-bold text-gray-900">{dashboardData.admittedPatients.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Currently under your direct care</p>
                    <Link to="/patients?status=admitted&doctor_id=me" className="text-blue-600 hover:underline text-sm mt-3 inline-block">Manage Admissions &rarr;</Link>
                </motion.div>

                {/* Unread Messages */}
                <motion.div variants={itemVariants} whileHover="hover" className="bg-white p-6 rounded-xl shadow-md border-b-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">Unread Messages</h3>
                        <MessageSquareMore className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-5xl font-bold text-gray-900">{dashboardData.unreadMessages.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Important communications</p>
                    <Link to="/messages?status=unread" className="text-blue-600 hover:underline text-sm mt-3 inline-block">Read Messages &rarr;</Link>
                </motion.div>
            </section>

            {/* B. Core Workflow Sections: Appointments & Patient Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Upcoming Appointments Table (Main Focus) */}
                <motion.section variants={itemVariants} className="lg:col-span-2 bg-white p-7 rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <Clock className="h-6 w-6 mr-2 text-blue-500" /> Upcoming Appointments
                        </h2>
                        <Link to="/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
                            View All <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>
                    {dashboardData.upcomingAppointments.length === 0 ? (
                        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                            <CalendarPlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-lg mb-2">No upcoming appointments found.</p>
                            <p className="text-md">Everything seems clear. Why not today.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <AnimatePresence>
                                        {dashboardData.upcomingAppointments.slice(0, 7).map((app) => ( // Show top 7
                                            <motion.tr
                                                key={app.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <Link to={`/patients/${app.patient_id}`} className="text-blue-600 hover:underline">
                                                        {app.patient_name || `Patient ID: ${app.patient_id}`}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(app.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(`2000/01/01 ${app.appointment_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type || 'Consultation'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                            app.status === 'Confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`
                                                    }>
                                                        {app.status || 'Scheduled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/appointments/${app.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                        Manage
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.section>

                {/* Critical Alerts & Messages (Stacked on right) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Critical Alerts */}
                    <motion.section variants={itemVariants} className="bg-white p-7 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                <AlertTriangle className="h-6 w-6 mr-2 text-red-500" /> Critical Alerts
                            </h2>
                            <Link to="/alerts" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
                                View All <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </Link>
                        </div>
                        {dashboardData.criticalAlerts.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                                <BellRing className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No critical alerts right now. All clear!</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                <AnimatePresence>
                                    {dashboardData.criticalAlerts.slice(0, 4).map((alert) => ( // Show top 4
                                        <motion.li
                                            key={alert.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start p-3 bg-red-50 rounded-lg shadow-sm border border-red-200"
                                        >
                                            <span className="inline-block w-3 h-3 rounded-full mt-1.5 mr-3 bg-red-600 flex-shrink-0"></span>
                                            <div>
                                                <p className="font-medium text-red-800 leading-tight">{alert.subject || alert.message}</p>
                                                <p className="text-xs text-red-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                            </div>
                                            <Link to={`/alerts/${alert.id}`} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium flex-shrink-0">
                                                View
                                            </Link>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </motion.section>

                    {/* Pending Lab Reports (Repeated in a smaller card) */}
                     <motion.section variants={itemVariants} className="bg-white p-7 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                <ClipboardList className="h-6 w-6 mr-2 text-yellow-500" /> Pending Lab Reports
                            </h2>
                            <Link to="/lab-reports?status=pending" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
                                View All <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </Link>
                        </div>
                        {dashboardData.pendingLabReports.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No lab reports awaiting review.</p>
                            </div>
                        ) : (
                            <ul>
                                <AnimatePresence>
                                    {dashboardData.pendingLabReports.slice(0, 3).map((report) => ( // Show top 3 here
                                        <motion.li
                                            key={report.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center justify-between p-3 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 rounded-md"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    <Link to={`/patients/${report.patient_id}`} className="hover:underline">{report.patient_name || `Patient ID: ${report.patient_id}`}</Link>
                                                </p>
                                                <p className="text-sm text-gray-500">{report.test_name}</p>
                                            </div>
                                            <Link to={`/lab-reports/${report.id}/review`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                Review &rarr;
                                            </Link>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </motion.section>
                </div>
            </div>

            {/* C. Secondary Sections: Recent Activity & My Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <motion.section variants={itemVariants} className="bg-white p-7 rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <History className="h-6 w-6 mr-2 text-indigo-500" /> Recent Activity Log
                        </h2>
                        <Link to="/activity-log" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
                            Full Log <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>
                    {dashboardData.recentActivities.length === 0 ? (
                        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                            <LayoutDashboard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p>No recent activity. Get started with your day!</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            <AnimatePresence>
                                {dashboardData.recentActivities.slice(0, 6).map((activity) => (
                                    <motion.li
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start p-3 bg-gray-50 rounded-md shadow-sm border border-gray-100"
                                    >
                                        <span className="inline-block w-2.5 h-2.5 rounded-full mt-2 mr-3 bg-gray-400 flex-shrink-0"></span>
                                        <div>
                                            <p className="font-medium text-gray-800 leading-tight">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </motion.section>

                {/* My Patient Snapshot */}
                <motion.section variants={itemVariants} className="bg-white p-7 rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <User className="h-6 w-6 mr-2 text-green-500" /> My Patient Snapshot
                        </h2>
                        <Link to="/patients" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
                            View All Patients <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                            <p className="text-xl font-semibold text-blue-800">Total Patients</p>
                            <p className="text-4xl font-bold text-blue-700 mt-1">{dashboardData.patientCount}</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                            <p className="text-xl font-semibold text-green-800">Available Slots (Today)</p>
                            <p className="text-4xl font-bold text-green-700 mt-1">{dashboardData.availableSlotsToday}</p>
                        </div>
                    </div>
                    {dashboardData.admittedPatients.length === 0 ? (
                        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                            <Bed className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p>No admitted patients under your direct care currently.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center"><Bed className="h-5 w-5 mr-2" /> Recently Admitted</h3>
                            <ul className="space-y-2">
                                <AnimatePresence>
                                    {dashboardData.admittedPatients.slice(0, 3).map((patient) => (
                                        <motion.li
                                            key={patient.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm border border-gray-100"
                                        >
                                            <Link to={`/patients/${patient.id}`} className="font-medium text-gray-800 hover:underline">
                                                {patient.first_name} {patient.last_name}
                                            </Link>
                                            <span className="text-sm text-gray-500">Room: {patient.room_number || 'N/A'}</span>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </div>
                    )}
                </motion.section>
            </div>

            {/* D. Call to Actions / Important Links */}
            <section className="mt-10 p-7 bg-blue-50 rounded-xl shadow-md border border-blue-200">
                <h2 className="text-2xl font-semibold text-blue-800 mb-5 flex items-center">
                    <Handshake className="h-6 w-6 mr-2 text-blue-600" /> Quick Actions & Resources
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/schedules?tab=availability" className="dashboard-action-card">
                        <CalendarCheck className="h-8 w-8 mb-3 text-blue-600" />
                        <span className="font-semibold text-lg">View Schedule</span>
                        <p className="text-sm text-gray-500">Manage your full schedule</p>
                    </Link>
                    <Link to="/clinical-notes" className="dashboard-action-card">
                        <BriefcaseMedical className="h-8 w-8 mb-3 text-purple-600" />
                        <span className="font-semibold text-lg">Clinical Notes</span>
                        <p className="text-sm text-gray-500">Issue and review patient's notes</p>
                    </Link>
                    <Link to="/reports/analytics" className="dashboard-action-card">
                        <BarChart className="h-8 w-8 mb-3 text-red-600" />
                        <span className="font-semibold text-lg">View Analytics</span>
                        <p className="text-sm text-gray-500">Access performance insights</p>
                    </Link>
                </div>
            </section>
        </motion.div>
    );
}

export default DoctorDashboardPage;