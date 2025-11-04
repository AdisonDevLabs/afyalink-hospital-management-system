// frontend/src/pages/NurseDashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, User, Loader2, FlaskConical, MessageSquareText, Bed, Clock, TrendingUp,
  Pill, HeartPulse, ClipboardList, BellRing, Stethoscope, FileText, CheckCircle, PlusCircle,
  Activity, ArrowRight, CalendarDays, Edit, Download, AlertTriangle, Camera
} from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = type === 'success' ? 'text-green-700 dark:text-green-100' : 'text-red-700 dark:text-red-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-6 w-6 text-green-500 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      ) : (
        <svg className="h-6 w-6 text-red-500 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
      )}
      <div className="font-medium">{message}</div>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 rounded-lg p-1.5 hover:bg-gray-300 transition-colors inline-flex h-8 w-8 items-center justify-center dark:text-gray-300 dark:hover:bg-gray-700">
        <span className="sr-only">Close alert</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </motion.div>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function NurseDashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    patientsAssignedToday: [], medicationsDueNow: [], vitalsNeedingUpdate: [],
    bedOccupancy: { available: 0, occupied: 0, total: 0, breakdown: {} },
    emergencyAlerts: [], shiftSchedule: [], totalPatientsUnderCare: 0,
    medicationsAdministeredToday: 0, vitalsRecordedToday: 0, newDoctorOrders: [],
    simulatedVitalsHistory: {}, simulatedEmergencyAlerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });

  const fetchSimulatedVitalsHistory = useCallback((patientId) => {
    const generateDummyVitals = () => {
      const history = [];
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - i * 3600 * 1000 * 4);
        history.unshift({
          timestamp: date.toISOString(),
          bp: `${Math.floor(Math.random() * (140 - 90) + 90)}/${Math.floor(Math.random() * (90 - 60) + 60)}`,
          hr: Math.floor(Math.random() * (100 - 60) + 60),
          temp: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1),
          spo2: Math.floor(Math.random() * (100 - 95) + 95),
        });
      }
      return history;
    };
    return generateDummyVitals();
  }, []);

  const simulateEmergencyAlerts = useCallback(() => {
    return [
      { id: 1, type: 'Code Blue', patient_name: 'Jane Doe', room_number: 'ICU 3', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), acknowledged: false },
      { id: 2, type: 'Fall Alert', patient_name: 'John Smith', room_number: 'Ward 201', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), acknowledged: false },
    ];
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!token || !user?.id) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const headers = { 'Authorization': `Bearer ${token}` };
      const fetchJson = async (url, name) => {
        const res = await fetch(url, { headers });
        if (!res.ok) { const errorText = await res.text(); throw new Error(`Failed to fetch ${name}: ${res.status} - ${errorText}`); }
        return res.json();
      };

      const [
        patientsData, medicationsDueData, vitalsNeedingUpdateData, bedOccupancyData,
        alertsData, scheduleData, totalPatientsUnderCareData,
        medicationsAdministeredTodayData, vitalsRecordedTodayData, newDoctorOrdersData,
      ] = await Promise.all([
        fetchJson(`${backendUrl}/api/v1/patients?nurse_id=${user.id}&assigned_today=${today}`, 'assigned patients'),
        fetchJson(`${backendUrl}/api/v1/medications/due?nurse_id=${user.id}`, 'due medications'),
        fetchJson(`${backendUrl}/api/v1/vitals/needs-update?nurse_id=${user.id}`, 'vitals needing update'),
        fetchJson(`${backendUrl}/api/v1/beds/availability`, 'bed occupancy'),
        fetchJson(`${backendUrl}/api/v1/alerts?recipient_role=nurse`, 'emergency alerts'),
        fetchJson(`${backendUrl}/api/v1/schedules?user_id=${user.id}&date=${today}`, 'shift schedule'),
        fetchJson(`${backendUrl}/api/v1/patients/count?nurse_id=${user.id}`, 'total patients under care count'),
        fetchJson(`${backendUrl}/api/v1/medications/administered/count?nurse_id=${user.id}&date=${today}`, 'medications administered today count'),
        fetchJson(`${backendUrl}/api/v1/vitals/recorded/count?nurse_id=${user.id}&date=${today}`, 'vitals recorded today count'),
        fetchJson(`${backendUrl}/api/v1/orders/new?nurse_id=${user.id}`, 'new doctor orders'),
      ]);

      const simulatedVitalsHistory = {};
      (patientsData.patients || []).forEach(patient => {
        simulatedVitalsHistory[patient.id] = fetchSimulatedVitalsHistory(patient.id);
      });

      setDashboardData({
        patientsAssignedToday: patientsData.patients || [],
        medicationsDueNow: medicationsDueData.medications || [],
        vitalsNeedingUpdate: vitalsNeedingUpdateData.vitals || [],
        bedOccupancy: bedOccupancyData || { available: 0, occupied: 0, total: 0, breakdown: {} },
        emergencyAlerts: alertsData.alerts || [],
        shiftSchedule: scheduleData.shifts || [],
        totalPatientsUnderCare: totalPatientsUnderCareData.count || 0,
        medicationsAdministeredToday: medicationsAdministeredTodayData.count || 0,
        vitalsRecordedToday: vitalsRecordedTodayData.count || 0,
        newDoctorOrders: newDoctorOrdersData.orders || [],
        simulatedVitalsHistory,
        simulatedEmergencyAlerts: simulateEmergencyAlerts(),
      });
    } catch (err) {
      console.error('Error fetching nurse dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
      setNotification({ message: 'Failed to load dashboard data. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, fetchSimulatedVitalsHistory, simulateEmergencyAlerts]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'nurse') {
      const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, user, fetchDashboardData]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role === 'nurse') {
      fetchDashboardData();
    } else if (!authLoading && (!isAuthenticated || user.role !== 'nurse')) {
      navigate('/unauthorized');
    }
  }, [authLoading, isAuthenticated, user, navigate, fetchDashboardData]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-2 text-xl text-gray-700 dark:text-gray-300 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || user.role !== 'nurse') {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 dark:bg-red-900 transition-colors duration-300">
        <div className="text-xl font-semibold text-red-700 dark:text-red-100 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-300 dark:border-red-700 transition-colors duration-300">
          <p className="flex items-center"><span className="mr-2 text-2xl">⚠️</span> Unauthorized Access!</p>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">Only nurses can view this page. Redirecting...</p>
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, colorClass, link, linkText }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between transform transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
          <p className={`text-4xl font-bold mt-1 ${colorClass} dark:text-opacity-90`}>{value.toLocaleString()}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} group-hover:scale-110 transition-transform
                          dark:${colorClass.replace('text-', 'bg-').replace('600', '900')} dark:${colorClass.replace('600', '400')}`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
      {link && (
        <Link to={link} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group transition duration-200 mt-2 text-sm
                                   dark:text-blue-400 dark:hover:text-blue-300">
          {linkText}
          <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      )}
    </motion.div>
  );

  const getPatientAvatar = (patient) => {
    if (patient.photo_url) return <img src={patient.photo_url} alt={patient.first_name} className="h-8 w-8 rounded-full object-cover mr-2" />;
    const initials = `${patient.first_name ? patient.first_name[0] : ''}${patient.last_name ? patient.last_name[0] : ''}`.toUpperCase();
    const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    const colors = ['blue', 'green', 'indigo', 'purple', 'pink', 'yellow', 'teal', 'cyan'];
    const baseColor = colors[hash % colors.length];
    return (
      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm bg-${baseColor}-200 text-${baseColor}-800 dark:bg-${baseColor}-700 dark:text-${baseColor}-100 mr-2 flex-shrink-0`}>
        {initials || '?'}
      </div>
    );
  };

  const getVitalStatusColor = (vital) => {
    const bpSystolic = parseInt(vital.bp?.split('/')[0]);
    const hr = parseInt(vital.hr);
    const temp = parseFloat(vital.temp);
    const spo2 = parseInt(vital.spo2);
    if (bpSystolic > 160 || bpSystolic < 90 || hr > 120 || hr < 50 || temp > 38.5 || spo2 < 90) return 'text-red-600 dark:text-red-400';
    if (bpSystolic > 140 || bpSystolic < 100 || hr > 100 || hr < 60 || temp > 37.8 || spo2 < 94) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const handleAcknowledgeAlert = (alertId) => {
    setDashboardData(prevData => ({
      ...prevData,
      simulatedEmergencyAlerts: prevData.simulatedEmergencyAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
    setNotification({ message: 'Emergency alert acknowledged.', type: 'success' });
  };

  return (
    <motion.div
      className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {notification.message && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: null, type: null })} />
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
          Welcome Back, Nurse {user ? user.last_name : ''}! 👋
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">Your vital overview for today's shift.</p>
        </h1>
        <div className="flex space-x-3">
             <Link to="/patients/assigned" className="hidden md:flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 dark:bg-blue-700 dark:hover:bg-blue-600">
                <User className="mr-2 h-5 w-5" /> View My Patients
            </Link>
            <Link to="/medications/due" className="hidden md:flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 dark:bg-green-700 dark:hover:bg-green-600">
                <Pill className="mr-2 h-5 w-5" /> Administer Meds
            </Link>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 shadow-sm dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Patients Assigned Today" value={dashboardData.patientsAssignedToday.length} icon={User} colorClass="text-blue-600" link="/patients/assigned" linkText="View Today's Patients" />
        <MetricCard title="Medications Due Now" value={dashboardData.medicationsDueNow.length} icon={Pill} colorClass="text-red-600" link="/medications/due" linkText="Administer Medications" />
        <MetricCard title="Vitals Needing Update" value={dashboardData.vitalsNeedingUpdate.length} icon={HeartPulse} colorClass="text-yellow-600" link="/vitals/needs-update" linkText="Record Vitals" />
        <MetricCard title="New Doctor Orders" value={dashboardData.newDoctorOrders.length} icon={ClipboardList} colorClass="text-purple-600" link="/orders/new" linkText="Review New Orders" />
        <MetricCard title="Total Patients Under Care" value={dashboardData.totalPatientsUnderCare} icon={Stethoscope} colorClass="text-green-600" link="/patients?nurse_id=me" linkText="All My Patients" />
        <MetricCard title="Medications Administered Today" value={dashboardData.medicationsAdministeredToday} icon={CheckCircle} colorClass="text-teal-600" link="/medications/administered" linkText="View Administered" />
        <MetricCard title="Vitals Recorded Today" value={dashboardData.vitalsRecordedToday} icon={FileText} colorClass="text-orange-600" link="/vitals/recorded" linkText="View Recorded Vitals" />
        <MetricCard title="Emergency Alerts" value={dashboardData.emergencyAlerts.length + dashboardData.simulatedEmergencyAlerts.filter(alert => !alert.acknowledged).length} icon={BellRing} colorClass="text-red-600" link="/alerts?role=nurse" linkText="View All Alerts" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" /> Quick Actions
          </h3>
          <div className="flex flex-col space-y-4 w-full">
            <Link to="/vitals/record" className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] dark:bg-blue-700 dark:hover:bg-blue-600">
              <PlusCircle className="mr-2 h-5 w-5" /> Record New Vitals
            </Link>
            <Link to="/nursing-notes/new" className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] dark:bg-green-700 dark:hover:bg-green-600">
              <Edit className="mr-2 h-5 w-5" /> Write Nursing Note
            </Link>
            <button onClick={() => { setNotification({ message: 'Shift handover initiated!', type: 'success' }); }} className="flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] dark:bg-purple-700 dark:hover:bg-purple-600">
              <Download className="mr-2 h-5 w-5" /> Generate Handover Report
            </button>
            <Link to="/imaging/upload" className="flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] dark:bg-orange-700 dark:hover:bg-orange-600">
              <Camera className="mr-2 h-5 w-5" /> Attach Wound Image
            </Link>
          </div>
        </motion.div>

        <motion.section variants={itemVariants} className="bg-red-50 dark:bg-red-900 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-700 col-span-full lg:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b border-red-200 dark:border-red-700 pb-4">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-100 flex items-center">
                  <BellRing className="h-6 w-6 text-red-600 dark:text-red-400 mr-2 animate-pulse" /> Emergency Tracker
              </h2>
              <Link to="/alerts/emergency" className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200 flex items-center dark:text-red-400 dark:hover:text-red-300">
                  View All <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.simulatedEmergencyAlerts.filter(alert => !alert.acknowledged).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-red-100 rounded-lg border border-dashed border-red-200 dark:bg-red-800 dark:border-red-700">No unacknowledged emergency alerts.</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {dashboardData.simulatedEmergencyAlerts.filter(alert => !alert.acknowledged).map((alert) => (
                  <motion.div
                    key={alert.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 border border-red-300 bg-red-100 rounded-md shadow-sm dark:border-red-700 dark:bg-red-800"
                  >
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-100 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                        {alert.type} - <Link to={`/patients/${alert.patient_id}`} className="hover:underline ml-1 dark:text-red-200 dark:hover:text-red-100">{alert.patient_name}</Link>
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">Room: {alert.room_number} | {new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <button onClick={() => handleAcknowledgeAlert(alert.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium shadow-sm dark:bg-red-700 dark:hover:bg-red-600">
                      Acknowledge
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" /> My Assigned Patients
              </h2>
              <Link to="/patients/assigned" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.patientsAssignedToday.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">No patients assigned to you today.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {dashboardData.patientsAssignedToday.slice(0, 5).map((patient) => (
                  <motion.li
                    key={patient.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-md dark:hover:bg-gray-700"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      {getPatientAvatar(patient)}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          <Link to={`/patients/${patient.id}`} className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                              {patient.first_name} {patient.last_name}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Room: {patient.room_number || 'N/A'} - Bed: {patient.bed_number || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700">
                      Assigned
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <Pill className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" /> Medications Due Now
              </h2>
              <Link to="/medications/due" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View Full Schedule <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.medicationsDueNow.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">No medications due for administration.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {dashboardData.medicationsDueNow.slice(0, 5).map((med) => (
                  <motion.li
                    key={med.id} className={`flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-md dark:hover:bg-gray-700 ${new Date(med.due_time) < new Date() ? 'bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-700' : ''}`}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      {getPatientAvatar(med)}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          <Link to={`/patients/${med.patient_id}`} className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                              {med.patient_name || `Patient ID: ${med.patient_id}`}
                          </Link>: {med.medication_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Dose: {med.dose} {med.unit} - {med.frequency}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Due: {new Date(med.due_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium shadow-sm dark:bg-green-700 dark:hover:bg-green-600">
                        Administer
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <HeartPulse className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-2" /> Vitals Needing Update
              </h2>
              <Link to="/vitals/needs-update" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.vitalsNeedingUpdate.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">All vitals are up-to-date.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {dashboardData.vitalsNeedingUpdate.slice(0, 5).map((vital) => (
                  <motion.li
                    key={vital.id} className={`flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-md dark:hover:bg-gray-700 ${getVitalStatusColor(dashboardData.simulatedVitalsHistory[vital.patient_id]?.[dashboardData.simulatedVitalsHistory[vital.patient_id].length - 1] || {}) === 'text-red-600 dark:text-red-400' ? 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700' : ''}`}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      {getPatientAvatar(vital)}
                      <div>
                        <p className={`font-medium text-gray-800 dark:text-gray-100 ${getVitalStatusColor(dashboardData.simulatedVitalsHistory[vital.patient_id]?.[dashboardData.simulatedVitalsHistory[vital.patient_id].length - 1] || {})}`}>
                          <Link to={`/patients/${vital.patient_id}`} className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                              {vital.patient_name || `Patient ID: ${vital.patient_id}`}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Last Recorded: {new Date(vital.last_recorded_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium shadow-sm dark:bg-yellow-700 dark:hover:bg-yellow-600">
                        Record Vitals
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
              <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-2" /> Vitals Trends Overview (Conceptual)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600 mb-4">
            This section would display sparkline charts for key vitals (e.g., BP, HR, Temp) for your assigned patients, showing recent trends at a glance.
            <br/>
            <span className="text-xs italic mt-2 block">Requires a charting library (e.g., Chart.js, Recharts) and historical vital data from backend.</span>
          </p>
          {dashboardData.patientsAssignedToday.slice(0, 3).map(patient => (
            <div key={patient.id} className="flex items-center justify-between py-2 px-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center">
                {getPatientAvatar(patient)}
                <span className="font-medium text-gray-800 dark:text-gray-100">{patient.first_name} {patient.last_name}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-block w-24 h-6 bg-gray-200 rounded-md animate-pulse dark:bg-gray-600"></span>
                <span className="ml-2 text-xs italic"> (BP, HR, Temp)</span>
              </div>
            </div>
          ))}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" /> New Doctor Orders
              </h2>
              <Link to="/orders/new" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View All <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.newDoctorOrders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">No new doctor orders.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {dashboardData.newDoctorOrders.slice(0, 5).map((order) => (
                  <motion.li
                    key={order.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-md dark:hover:bg-gray-700"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      {getPatientAvatar(order)}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          <Link to={`/patients/${order.patient_id}`} className="hover:underline text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                              {order.patient_name || `Patient ID: ${order.patient_id}`}
                          </Link>: {order.order_type}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Ordered by Dr. {order.doctor_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Time: {new Date(order.order_time).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full transition-colors font-medium shadow-sm dark:bg-purple-700 dark:hover:bg-purple-600">
                        View Order
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" /> Your Shift Schedule Today
              </h2>
              <Link to="/schedules" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View Full Schedule <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.shiftSchedule.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">No shifts scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {dashboardData.shiftSchedule.map((shift) => (
                  <motion.li
                    key={shift.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors rounded-md dark:hover:bg-gray-700"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{shift.shift_name || 'Assigned Shift'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {shift.location && <p className="text-xs text-gray-400 dark:text-gray-500">Location: {shift.location}</p>}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700">
                      {shift.type || 'Regular Shift'}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        <motion.section variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <Bed className="h-6 w-6 text-teal-600 dark:text-teal-400 mr-2" /> Bed Occupancy Snapshot
              </h2>
              <Link to="/beds" className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200 flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                  View Bed Details <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
          </div>
          {dashboardData.bedOccupancy.total === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-700 dark:border-gray-600">Bed occupancy data not available.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700 dark:text-gray-200">Overall Occupancy:</p>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {dashboardData.bedOccupancy.occupied || 0} / {dashboardData.bedOccupancy.total || 0}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    ({((dashboardData.bedOccupancy.occupied / dashboardData.bedOccupancy.total) * 100).toFixed(1)}% occupied)
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(dashboardData.bedOccupancy.occupied / dashboardData.bedOccupancy.total) * 100}%` }}
                ></div>
              </div>

              {dashboardData.bedOccupancy.breakdown && Object.keys(dashboardData.bedOccupancy.breakdown).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Occupancy by Ward/Type:</h3>
                  <ul>
                    {Object.entries(dashboardData.bedOccupancy.breakdown).map(([ward, data]) => (
                      <motion.li
                        key={ward} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 rounded-md px-2 dark:hover:bg-gray-700"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }}
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-200">{ward}:</span>
                        <span className="text-gray-600 dark:text-gray-300">{data.occupied} / {data.total} beds</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}

export default NurseDashboardPage;