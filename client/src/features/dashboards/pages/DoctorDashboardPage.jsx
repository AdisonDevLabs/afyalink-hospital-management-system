// frontend/src/pages/DoctorDashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, CalendarCheck, FileText, MessageSquareText,
    Bed, Clock, ClipboardList, Stethoscope, BriefcaseMedical, CalendarPlus, BellRing,
    Search, PlusCircle, History, AlertTriangle, MessageSquareMore, BarChart, TrendingUp, Handshake, Loader2
} from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const colorMap = {
        success: { bg: 'bg-green-50 dark:bg-green-900', border: 'border-green-400 dark:border-green-600', text: 'text-green-800 dark:text-green-100', icon: 'text-green-500 dark:text-green-400', Icon: CalendarCheck },
        error: { bg: 'bg-red-50 dark:bg-red-900', border: 'border-red-400 dark:border-red-600', text: 'text-red-800 dark:text-red-100', icon: 'text-red-500 dark:text-red-400', Icon: BellRing },
        info: { bg: 'bg-blue-50 dark:bg-blue-900', border: 'border-blue-400 dark:border-blue-600', text: 'text-blue-800 dark:text-blue-100', icon: 'text-blue-500 dark:text-blue-400', Icon: BriefcaseMedical },
    };

    const { bg, border, text, icon, Icon } = colorMap[type] || colorMap.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed top-6 right-6 z-[1000] p-4 rounded-lg shadow-xl flex items-center space-x-3
                        ${bg} ${border} ${text} border-l-4 pr-10 min-w-[300px] max-w-sm transition-colors duration-300`}
            role="alert"
        >
            <Icon className={`h-6 w-6 ${icon}`} />
            <div className="flex-grow">{message}</div>
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700
                           dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            >
                <span className="sr-only">Close alert</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </motion.div>
    );
};

const DashboardCard = ({ title, value, subText, linkTo, linkText, icon: Icon, borderColor, children }) => (
    <motion.div
        variants={{
            hidden: { y: 30, opacity: 0 },
            visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 100, damping: 10 },
            },
            hover: {
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                transition: { duration: 0.2 }
            }
        }}
        whileHover="hover"
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-b-4 ${borderColor} hover:shadow-lg transition-shadow duration-300`}
    >
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
            <Icon className={`h-8 w-8 ${borderColor.replace('border-', 'text-')}`} />
        </div>
        {value !== undefined && <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">{value}</p>}
        {subText && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subText}</p>}
        {children}
        {linkTo && linkText && (
            <Link to={linkTo} className="text-blue-600 hover:underline text-sm mt-3 inline-block dark:text-blue-400 dark:hover:text-blue-300">
                {linkText} &rarr;
            </Link>
        )}
    </motion.div>
);

// --- Reusable Section Component ---
const DashboardSection = ({ title, icon: Icon, linkTo, linkText, children, noDataMessage, noDataIcon: NoDataIcon }) => (
    <motion.section
        variants={{
            hidden: { y: 30, opacity: 0 },
            visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 100, damping: 10 },
            },
        }}
        className="bg-white dark:bg-gray-800 p-7 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    >
        <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <Icon className={`h-6 w-6 mr-2 ${Icon === AlertTriangle ? 'text-red-500' : Icon === Clock ? 'text-blue-500' : Icon === ClipboardList ? 'text-yellow-500' : Icon === History ? 'text-indigo-500' : 'text-green-500'}`} />
                {title}
            </h2>
            {linkTo && linkText && (
                <Link to={linkTo} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group dark:text-blue-400 dark:hover:text-blue-300">
                    {linkText} <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
            )}
        </div>
        {React.Children.count(children) === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {NoDataIcon && <NoDataIcon className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />}
                <p className="text-lg mb-2">{noDataMessage}</p>
            </div>
        ) : (
            children
        )}
    </motion.section>
);


const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
        availableSlotsToday: 0,
        unreadMessages: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: null, type: null });

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: null, type: null }), 5000);
    };

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const fetchDashboardData = useCallback(async () => {
        if (!token || !user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const todayDateString = new Date().toISOString().split('T')[0];

            const endpoints = {
                todaysAppointments: `${backendUrl}/api/v1/appointments?doctor_id=${user.id}&date=${todayDateString}&status=Scheduled`,
                allAppointments: `${backendUrl}/api/v1/appointments?doctor_id=${user.id}`,
                labReports: `${backendUrl}/api/v1/lab-reports?doctor_id=${user.id}&status=pending`,
                admittedPatients: `${backendUrl}/api/v1/patients?admitted_by=${user.id}`,
                criticalAlerts: `${backendUrl}/api/v1/alerts/by-user?recipient_id=${user.id}&severity=critical`,
                patientCount: `${backendUrl}/api/v1/patients/count?doctor_id=${user.id}`,
                recentActivities: `${backendUrl}/api/v1/doctor-activities?doctor_id=${user.id}&limit=5`,
                unreadMessages: `${backendUrl}/api/v1/messages?recipient_id=${user.id}&status=unread`,
            };

            const fetchPromises = Object.values(endpoints).map(url =>
                fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch ${url.split('?')[0].split('/').pop()}: ${res.statusText}`);
                    return res.json();
                })
            );

            const [
                todaysAppointmentsData,
                allAppointmentsData,
                labReportsData,
                admittedPatientsData,
                criticalAlertsData,
                patientCountData,
                recentActivitiesData,
                unreadMessagesData
            ] = await Promise.all(fetchPromises);

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const upcoming = allAppointmentsData
                .filter(app => {
                    const appointmentDate = new Date(app.appointment_date);
                    appointmentDate.setHours(0, 0, 0, 0);
                    return appointmentDate > now;
                })
                .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

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
                unreadMessages: unreadMessagesData.messages || [],
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
        if (!authLoading) {
            if (isAuthenticated && user?.role === 'doctor') {
                fetchDashboardData();
            } else {
                showNotification('You are not authorized to view this page.', 'error');
                navigate('/unauthorized');
            }
        }
    }, [authLoading, isAuthenticated, user, navigate, fetchDashboardData]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { when: "beforeChildren", staggerChildren: 0.08 },
        },
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <p className="mt-4 text-xl font-medium">Loading your secure dashboard...</p>
                <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Please wait while we fetch your data.</p>
            </div>
        );
    }

    if (!isAuthenticated || user.role !== 'doctor') {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 transition-colors duration-300">
                <AlertTriangle className="h-20 w-20 text-red-500 dark:text-red-400 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-lg text-center">You must be logged in as a doctor to view this page.</p>
                <Link to="/login" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition duration-300">
                    Go to Login
                </Link>
            </div>
        );
    }
    

    return (
        <motion.div
            className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300"
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

            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
                        Welcome Back, Doctor {user ? user.last_name : ''}
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-1'>Today is {currentDate}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/patients/" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        <Search className="h-5 w-5 mr-2" /> Find Patient
                    </Link>
                    <Link to="/profile" className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        <User className="h-5 w-5 mr-2" /> My Profile
                    </Link>
                </div>
            </header>

            {error && (
                <motion.div
                    className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-6 shadow-sm dark:bg-red-900 dark:border-red-700 dark:text-red-100"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <strong className="font-bold mr-2">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                </motion.div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <DashboardCard
                    title="Today's Appointments"
                    value={dashboardData.todayAppointmentsCount}
                    subText={`Scheduled for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    linkTo="/appointments?date=today"
                    linkText="View Details"
                    icon={CalendarCheck}
                    borderColor="border-blue-500"
                />
                <DashboardCard
                    title="Pending Lab Reports"
                    value={dashboardData.pendingLabReports.length}
                    subText="Awaiting your review"
                    linkTo="/lab-reports?status=pending"
                    linkText="Review Now"
                    icon={FileText}
                    borderColor="border-yellow-500"
                />
                <DashboardCard
                    title="My Admitted Patients"
                    value={dashboardData.admittedPatients.length}
                    subText="Currently under your direct care"
                    linkTo="/patients?status=admitted&doctor_id=me"
                    linkText="Manage Admissions"
                    icon={Bed}
                    borderColor="border-green-500"
                />
                <DashboardCard
                    title="Unread Messages"
                    value={dashboardData.unreadMessages.length}
                    subText="Important communications"
                    linkTo="/messages?status=unread"
                    linkText="Read Messages"
                    icon={MessageSquareMore}
                    borderColor="border-purple-500"
                />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <DashboardSection
                    title="Upcoming Appointments"
                    icon={Clock}
                    linkTo="/appointments"
                    linkText="View All"
                    noDataMessage="No upcoming appointments found. Everything seems clear. Why not today."
                    noDataIcon={CalendarPlus}
                >
                    {dashboardData.upcomingAppointments.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <AnimatePresence>
                                        {dashboardData.upcomingAppointments.slice(0, 7).map((app) => (
                                            <motion.tr
                                                key={app.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    <Link to={`/patients/${app.patient_id}`} className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                                        {app.patient_name || `Patient ID: ${app.patient_id}`}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(app.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(`2000/01/01 ${app.appointment_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{app.type || 'Consultation'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                                                            app.status === 'Confirmed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100' :
                                                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`
                                                    }>
                                                        {app.status || 'Scheduled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/appointments/${app.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
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
                </DashboardSection>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <DashboardSection
                        title="Critical Alerts"
                        icon={AlertTriangle}
                        linkTo="/alerts"
                        linkText="View All"
                        noDataMessage="No critical alerts right now. All clear!"
                        noDataIcon={BellRing}
                    >
                        {dashboardData.criticalAlerts.length > 0 && (
                            <ul className="space-y-3">
                                <AnimatePresence>
                                    {dashboardData.criticalAlerts.slice(0, 4).map((alert) => (
                                        <motion.li
                                            key={alert.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start p-3 bg-red-50 dark:bg-red-900 rounded-lg shadow-sm border border-red-200 dark:border-red-700"
                                        >
                                            <span className="inline-block w-3 h-3 rounded-full mt-1.5 mr-3 bg-red-600 dark:bg-red-400 flex-shrink-0"></span>
                                            <div>
                                                <p className="font-medium text-red-800 dark:text-red-100 leading-tight">{alert.subject || alert.message}</p>
                                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                            </div>
                                            <Link to={`/alerts/${alert.id}`} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium flex-shrink-0 dark:text-red-400 dark:hover:text-red-300">
                                                View
                                            </Link>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </DashboardSection>

                    <DashboardSection
                        title="Pending Lab Reports"
                        icon={ClipboardList}
                        linkTo="/lab-reports?status=pending"
                        linkText="View All"
                        noDataMessage="No lab reports awaiting review."
                        noDataIcon={FileText}
                    >
                        {dashboardData.pendingLabReports.length > 0 && (
                            <ul>
                                <AnimatePresence>
                                    {dashboardData.pendingLabReports.slice(0, 3).map((report) => (
                                        <motion.li
                                            key={report.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center justify-between p-3 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 rounded-md dark:border-gray-700 dark:hover:bg-gray-700 dark:bg-gray-800"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                                    <Link to={`/patients/${report.patient_id}`} className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">{report.patient_name || `Patient ID: ${report.patient_id}`}</Link>
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-300">{report.test_name}</p>
                                            </div>
                                            <Link to={`/lab-reports/${report.id}/review`} className="text-blue-600 hover:text-blue-700 text-sm font-medium dark:text-blue-400 dark:hover:text-blue-300">
                                                Review &rarr;
                                            </Link>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </DashboardSection>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardSection
                    title="Recent Activity Log"
                    icon={History}
                    linkTo="/activity-log"
                    linkText="Full Log"
                    noDataMessage="No recent activity. Get started with your day!"
                    noDataIcon={LayoutDashboard}
                >
                    {dashboardData.recentActivities.length > 0 && (
                        <ul className="space-y-3">
                            <AnimatePresence>
                                {dashboardData.recentActivities.slice(0, 6).map((activity) => (
                                    <motion.li
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600"
                                    >
                                        <span className="inline-block w-2.5 h-2.5 rounded-full mt-2 mr-3 bg-gray-400 dark:bg-gray-500 flex-shrink-0"></span>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-100 leading-tight">{activity.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </DashboardSection>

                <DashboardSection
                    title="My Patient Snapshot"
                    icon={User}
                    linkTo="/patients"
                    linkText="View All Patients"
                    noDataMessage="No admitted patients under your direct care currently."
                    noDataIcon={Bed}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900 p-5 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-xl font-semibold text-blue-800 dark:text-blue-100">Total Patients</p>
                            <p className="text-4xl font-bold text-blue-700 dark:text-blue-200 mt-1">{dashboardData.patientCount}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900 p-5 rounded-lg border border-green-200 dark:border-green-700">
                            <p className="text-xl font-semibold text-green-800 dark:text-green-100">Available Slots (Today)</p>
                            <p className="text-4xl font-bold text-green-700 dark:text-green-200 mt-1">{dashboardData.availableSlotsToday}</p>
                        </div>
                    </div>
                    {dashboardData.admittedPatients.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center"><Bed className="h-5 w-5 mr-2" /> Recently Admitted</h3>
                            <ul className="space-y-2">
                                <AnimatePresence>
                                    {dashboardData.admittedPatients.slice(0, 3).map((patient) => (
                                        <motion.li
                                            key={patient.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600"
                                        >
                                            <Link to={`/patients/${patient.id}`} className="font-medium text-gray-800 hover:underline dark:text-gray-100 dark:hover:text-gray-50">
                                                {patient.first_name} {patient.last_name}
                                            </Link>
                                            <span className="text-sm text-gray-500 dark:text-gray-300">Room: {patient.room_number || 'N/A'}</span>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </div>
                    )}
                </DashboardSection>
            </div>

            <section className="mt-10 p-7 bg-blue-50 dark:bg-blue-900 rounded-xl shadow-md border border-blue-200 dark:border-blue-700">
                <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-100 mb-5 flex items-center">
                    <Handshake className="h-6 w-6 mr-2 text-blue-600" /> Quick Actions & Resources
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/schedules?tab=availability" className="dashboard-action-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
                        <CalendarCheck className="h-8 w-8 mb-3 text-blue-600" />
                        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">View Schedule</span>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Manage your full schedule</p>
                    </Link>
                    <Link to="/clinical-notes" className="dashboard-action-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
                        <BriefcaseMedical className="h-8 w-8 mb-3 text-purple-600" />
                        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">Clinical Notes</span>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Issue and review patient's notes</p>
                    </Link>
                    <Link to="/reports/analytics" className="dashboard-action-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
                        <BarChart className="h-8 w-8 mb-3 text-red-600" />
                        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">View Analytics</span>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Access performance insights</p>
                    </Link>
                </div>
            </section>
        </motion.div>
    );
}

export default DoctorDashboardPage;