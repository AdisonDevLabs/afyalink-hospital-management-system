// frontend/src/pages/ReceptionistDashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, User, CalendarCheck, Search, Loader2, Hospital, Stethoscope, Bed, Clock,
  DollarSign, ClipboardList, TrendingUp // Added for more general hospital metrics
} from 'lucide-react';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center space-x-3
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <div className="font-medium">{message}</div>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 rounded-lg p-1.5 hover:bg-gray-300 transition-colors inline-flex h-8 w-8 items-center justify-center">
        <span className="sr-only">Close alert</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </motion.div>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

function ReceptionistDashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [dashboardData, setDashboardData] = useState({
    todaysAppointments: [],
    recentRegistrations: [],
    bedAvailability: { available: 0, occupied: 0, total: 0 },
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointmentsToday: 0,
    totalDepartments: 0,
    totalRevenueToday: 0, // Added for more details
    pendingPayments: 0, // Added for more details
  });
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false); // Placeholder for actual modal
  const [showScheduleAppointmentModal, setShowScheduleAppointmentModal] = useState(false); // Placeholder for actual modal

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      console.log('fetchDashboardData skipped: token is not available.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        appointmentsResponse,
        registrationsResponse,
        bedAvailabilityResponse,
        patientsCountResponse,
        adminsCountResponse,
        //appointmentsTodayCountResponse,
        departmentsCountResponse,
        //revenueTodayResponse, // New fetch
        pendingPaymentsResponse, // New fetch
      ] = await Promise.all([
        fetch(`${backendUrl}/api/appointments?date=${today}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/patients/recent`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/beds/availability`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/patients/count`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        //fetch(`${backendUrl}/api/appointments?date=${today}&status=Scheduled`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/departments/count`, { headers: { 'Authorization': `Bearer ${token}` } }),
        //fetch(`${backendUrl}/api/payments/revenue/today`, { headers: { 'Authorization': `Bearer ${token}` } }), // Assuming endpoint for today's revenue
        fetch(`${backendUrl}/api/payments/pending/count`, { headers: { 'Authorization': `Bearer ${token}` } }), // Assuming endpoint for pending payments
      ]);

      const [
        appointmentsData,
        registrationsData,
        bedData,
        patientsCountData,
        adminsCountData,
        //appointmentsTodayCountData,
        departmentsCountData,
        //revenueTodayData,
        pendingPaymentsData,
      ] = await Promise.all([
        appointmentsResponse.json(),
        registrationsResponse.json(),
        bedAvailabilityResponse.json(),
        patientsCountResponse.json(),
        adminsCountResponse.json(),
        //appointmentsTodayCountResponse.json(),
        departmentsCountResponse.json(),
        //revenueTodayResponse.json(),
        pendingPaymentsResponse.json(),
      ]);

      setDashboardData({
        todaysAppointments: appointmentsData || [],
        recentRegistrations: registrationsData.patients || [], // Assuming 'patients' array
        bedAvailability: bedData || { available: 0, occupied: 0, total: 0 },
        totalPatients: patientsCountData.count || 0,
        totalDoctors: adminsCountData.totalDoctors || 0,
        totalAppointmentsToday: adminsCountData.todaysAppointments || 0,
        totalDepartments: departmentsCountData.count || 0,
        totalRevenueToday: adminsCountData.revenueSummary || 0,
        pendingPayments: pendingPaymentsData.count || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setNotification({ message: 'Failed to load dashboard data. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
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
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, user, token, navigate, fetchDashboardData]);

  const closeNotification = () => {
    setNotification({ message: null, type: null });
  };

  // Helper to get badge classes based on appointment status
  const getAppointmentStatusBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'checked-in': return 'bg-green-100 text-green-700 border border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-700 border border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Handle patient check-in
  const handleCheckIn = async (appointmentId) => {
    try {
      const response = await fetch(`${backendUrl}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'checked-in' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNotification({ message: 'Patient checked in successfully!', type: 'success' });
      fetchDashboardData(); // Refresh data

    } catch (error) {
      console.error('Error checking in patient:', error);
      setNotification({ message: `Error checking in patient: ${error.message}`, type: 'error' });
    }
  };

  // Filter appointments based on search term
  const filterAppointments = dashboardData.todaysAppointments.filter(app =>
    app.patient_name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    app.doctor_name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    app.department_name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    app.status?.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  // Handle patient search functionality
  const handlePatientSearch = (e) => {
    setPatientSearchTerm(e.target.value);
  };

  // Quick glance metric card component
  const MetricCard = ({ title, value, icon: Icon, colorClass, link, linkText, currency = false }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transform transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
          <p className={`text-4xl font-bold mt-1 ${colorClass}`}>
            {currency && '$'}{value.toLocaleString()}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} group-hover:scale-110 transition-transform`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
      {link && (
        <Link to={link} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group transition duration-200 mt-2 text-sm">
          {linkText}
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </Link>
      )}
    </motion.div>
  );


  return (
    <motion.div
      className="flex-1 p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen"
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

      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          Welcome, {user ? user.first_name : 'Receptionist'}! 👋
          <p className="text-lg font-medium text-gray-600 mt-2">Your comprehensive overview for the day.</p>
        </h1>
        <div className="flex space-x-3">
            <Link to="/appointments/schedule" className="hidden md:flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105">
                <CalendarCheck className="mr-2 h-5 w-5" /> Schedule Appointment
            </Link>
            <Link to="/patients/register" className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105">
                <PlusCircle className="mr-2 h-5 w-5" /> Register New Patient
            </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-lg border border-gray-100">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <span className="ml-3 text-xl text-gray-700 mt-4">Loading dashboard data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Key Metric Cards */}
          <MetricCard
            title="Total Patients"
            value={dashboardData.totalPatients}
            icon={User}
            colorClass="text-purple-600"
            link="/patients"
            linkText="View All Patients"
          />
          <MetricCard
            title="Total Doctors"
            value={dashboardData.totalDoctors}
            icon={Stethoscope}
            colorClass="text-indigo-600"
            link="/doctors"
            linkText="View All Doctors"
          />
          <MetricCard
            title="Appointments Today"
            value={dashboardData.totalAppointmentsToday}
            icon={CalendarCheck}
            colorClass="text-teal-600"
            link="/appointments"
            linkText="View Today's Appointments"
          />
          <MetricCard
            title="Total Departments"
            value={dashboardData.totalDepartments}
            icon={Hospital}
            colorClass="text-orange-600"
            link="/departments"
            linkText="View All Departments"
          />
          <MetricCard
            title="Revenue Today"
            value={dashboardData.totalRevenueToday}
            icon={DollarSign}
            colorClass="text-green-600"
            link="/payments"
            linkText="View Payments"
            currency={true}
          />
          <MetricCard
            title="Pending Payments"
            value={dashboardData.pendingPayments}
            icon={ClipboardList}
            colorClass="text-red-600"
            link="/payments?status=pending"
            linkText="Resolve Payments"
          />

          {/* Quick Actions Panel (visible on smaller screens as well) */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-full xl:col-span-1 order-1 xl:order-2">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 border-b border-gray-100 pb-4 flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" /> Essential Actions
            </h3>
            <div className="flex flex-col space-y-4 w-full">
              <Link
                to="/patients/register"
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 flex items-center justify-center w-full transform hover:scale-[1.02]"
              >
                <PlusCircle className="mr-2 h-5 w-5" /> New Patient Registration
              </Link>
              <Link
                to="/appointments/schedule"
                className="btn btn-primary bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 flex items-center justify-center w-full transform hover:scale-[1.02]"
              >
                <CalendarCheck className="mr-2 h-5 w-5" /> Schedule New Appointment
              </Link>
              <Link
                to="/payments/create"
                className="btn btn-primary bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 flex items-center justify-center w-full transform hover:scale-[1.02]"
              >
                <DollarSign className="mr-2 h-5 w-5" /> Process Payment
              </Link>
            </div>
            {/* Patient Search */}
            <div className="relative mt-6 pt-6 border-t border-gray-100">
              <input
                type="text"
                placeholder="Search Appointments (Patient, Doctor, Status)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm"
                value={patientSearchTerm}
                onChange={handlePatientSearch}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400 h-5 w-5" />
            </div>
          </motion.div>

          {/* Today's Appointments - Main Section */}
          <motion.section variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-full xl:col-span-3 order-2 xl:order-1">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                <CalendarCheck className="h-6 w-6 text-blue-600 mr-2" /> Today's Appointments
                </h3>
                <Link to="/appointments" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center">
                    View All <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
            </div>
            {filterAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">No appointments scheduled for today matching your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    <AnimatePresence>
                      {filterAppointments.map((appointment) => (
                        <motion.tr
                          key={appointment.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-2" />
                              {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                            <Link to={`/patients/${appointment.patient_id}`} className="flex items-center group">
                              <User className="h-4 w-4 mr-2 text-blue-500 group-hover:text-blue-700" />
                              {appointment.patient_name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{appointment.doctor_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{appointment.department_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentStatusBadgeClasses(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            {appointment.status?.toLowerCase() === 'scheduled' && (
                              <button
                                onClick={() => handleCheckIn(appointment.id)}
                                className="text-green-600 hover:text-green-800 transition duration-200 px-3 py-1 rounded-md border border-green-300 hover:border-green-500 font-semibold"
                                title="Check In Patient"
                              >
                                Check-in
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

          {/* Recent Patient Registrations */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-full md:col-span-1 lg:col-span-1 order-3">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                    <User className="h-6 w-6 text-purple-600 mr-2" /> Recent Registrations
                </h3>
                <Link to="/patients" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center">
                    View All <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
            </div>
            {dashboardData.recentRegistrations.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No recent registrations.</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {dashboardData.recentRegistrations.slice(0, 5).map((patient) => ( // Show top 5
                    <motion.div
                      key={patient.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-base font-medium text-gray-900 flex items-center">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {patient.created_at
                            ? new Date(patient.created_at.includes('T') ? patient.created_at : `${patient.created_at}T00:00:00`).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200 flex items-center"
                        title="View Patient Profile"
                      >
                        Profile <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Bed Availability */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-full md:col-span-1 lg:col-span-1 order-4">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                    <Bed className="h-6 w-6 text-indigo-600 mr-2" /> Bed Availability
                </h3>
                <Link to="/beds" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center">
                    Manage Beds <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center justify-between mt-4 text-center">
              <div>
                <p className="text-4xl font-bold text-blue-600">{dashboardData.bedAvailability.available || 0}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-red-600">{dashboardData.bedAvailability.occupied || 0}</p>
                <p className="text-sm text-gray-500">Occupied</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-700">{dashboardData.bedAvailability.total || 0}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
            <div className="mt-6 w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(dashboardData.bedAvailability.occupied / dashboardData.bedAvailability.total) * 100 || 0}%` }}
              ></div>
            </div>
            {dashboardData.bedAvailability.total > 0 && (
                <p className="text-sm text-gray-600 text-center mt-2">
                    {Math.round((dashboardData.bedAvailability.occupied / dashboardData.bedAvailability.total) * 100) || 0}% beds occupied
                </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Modals for New Patient and Schedule Appointment - Placeholder */}
      {/* You'll need to create these modal components separately and pass necessary props */}
      {/*
      <PatientRegistrationModal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onSuccess={fetchDashboardData} // Refresh data after successful registration
      />

      <AppointmentSchedulingModal
        isOpen={showScheduleAppointmentModal}
        onClose={() => setShowScheduleAppointmentModal(false)}
        onSuccess={fetchDashboardData} // Refresh data after successful scheduling
      />
      */}
    </motion.div>
  );
}

export default ReceptionistDashboardPage;