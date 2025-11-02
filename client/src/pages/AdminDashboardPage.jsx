import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { ShieldAlert, Users, CalendarCheck, FileText, DollarSign, Briefcase } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAdminService } from '../hooks/useAdminService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);


// Reusable Demo Mode Alert Component
const DemoModeAlert = ({ theme }) => (
    <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${theme === 'dark' ? 'bg-yellow-900 border border-yellow-700 text-yellow-200' : 'bg-yellow-100 border border-yellow-300 text-yellow-800'}`}>
        <ShieldAlert className="h-6 w-6 mr-3 flex-shrink-0" />
        <div className="font-semibold">
            <span className="font-bold">DEMO MODE ACTIVE:</span> This is a read-only view. 
            All data shown is sample data. Write operations (create, edit, delete) are disabled throughout the system.
        </div>
    </div>
);


function AdminDashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, todaysAppointments: 0, revenueSummary: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysAppointmentsList, setTodaysAppointmentsList] = useState([]);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const { fetchStats, fetchAppointmentStats, isLoading, error } = useAdminService();

  const getChartColors = useCallback((isDarkMode) => ({
    lineChartBackground: isDarkMode ? 'rgba(75, 192, 192, 0.4)' : 'rgba(75, 192, 192, 0.6)',
    lineChartBorder: isDarkMode ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 1)',
    pieChartBackgrounds: isDarkMode
      ? ['rgba(54, 162, 235, 0.4)', 'rgba(75, 192, 192, 0.4)', 'rgba(255, 99, 132, 0.4)', 'rgba(255, 206, 86, 0.4)']
      : ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
    pieChartBorders: isDarkMode
      ? ['rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)']
      : ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
    fontColor: isDarkMode ? '#CBD5E0' : '#4A5568',
    gridLineColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltipBgColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
    tooltipBorderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
  }), []);

  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Appointments',
      data: [65, 59, 80, 81, 56, 55, 40, 60, 70, 75, 85, 90],
      backgroundColor: getChartColors(theme === 'dark').lineChartBackground,
      borderColor: getChartColors(theme === 'dark').lineChartBorder,
      borderWidth: 1,
    }],
  });

  const [pieChartData, setPieChartData] = useState({
    labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: getChartColors(theme === 'dark').pieChartBackgrounds,
      borderColor: getChartColors(theme === 'dark').pieChartBorders,
      borderWidth: 1,
    }],
  });

  const [chartOptions, setChartOptions] = useState({});
  const [pieChartOptions, setPieChartOptions] = useState({});

  useEffect(() => {
    // Chart options update logic remains the same
    const isDarkMode = theme === 'dark';
    const colors = getChartColors(isDarkMode);

    const commonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: colors.fontColor } },
        tooltip: {
          backgroundColor: colors.tooltipBgColor,
          borderColor: colors.tooltipBorderColor,
          borderWidth: 1,
          titleColor: colors.fontColor,
          bodyColor: colors.fontColor,
        },
      },
    };

    setChartData(prevData => ({
      ...prevData,
      datasets: prevData.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: colors.lineChartBackground,
        borderColor: colors.lineChartBorder,
      })),
    }));

    setPieChartData(prevData => ({
      ...prevData,
      datasets: prevData.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: colors.pieChartBackgrounds,
        borderColor: colors.pieChartBorders,
      })),
    }));

    setChartOptions({
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        title: { display: true, text: 'Monthly Appointments', color: colors.fontColor },
      },
      scales: {
        x: { ticks: { color: colors.fontColor }, grid: { color: colors.gridLineColor } },
        y: { ticks: { color: colors.fontColor }, grid: { color: colors.gridLineColor } },
      },
    });

    setPieChartOptions({
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        title: { display: true, text: 'Appointment Status', color: colors.fontColor },
      },
    });

  }, [theme, getChartColors]);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- Data Fetching Hooks (Updated with isDemoMode Fallback) ---

  const fetchAdminDashboardData = useCallback(async () => {
    if (!isAuthenticated && isDemoMode) return;
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      if (isDemoMode) {
          // Fallback data for Demo Mode
          setStats({ totalPatients: 1500, totalDoctors: 35, todaysAppointments: 12, revenueSummary: 15000 });
      }
    }
    try {
      const data = await fetchAppointmentStats();
      const labels = data.map(item => item.status);
      const counts = data.map(item => parseInt(item.count, 10));

      setPieChartData(prevData => ({
        ...prevData,
        lebels: labels,
        datasets: prevData.datasets.map(dataset => ({ ...dataset, data: counts })),
      }));
    } catch (err) {
      console.error('Error fetching appointment status counts:', err);
      if (isDemoMode) {
        setPieChartData(prevData => ({
          ...prevData,
          labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
          datasets: prevData.datasets.map(dataset => ({ ...dataset, data: [150, 450, 50, 20] })),
        }));
      }
    }
  }, [isAuthenticated, isDemoMode, fetchStats, fetchAppointmentStats]);

  const fetchTodaysAppointments = useCallback(async () => {
    if (isDemoMode) {
      setTodaysAppointmentsList([
        { id: 1, patient_name: 'Jane Doe', appointment_time: '9:00 AM', doctor_name: 'Dr. Smith' },
        { id: 2, patient_name: 'John Smith', appointment_time: '10:30 AM', doctor_name: 'Dr. Lee' },
        { id: 3, patient_name: 'Sarah Chen', appointment_time: '11:00 AM', doctor_name: 'Dr. Smith' },
      ]);
    } else {
      console.warn("Using mock data for today's appointments. Please implement real appointment fetching.");
      setTodaysAppointmentsList([]);
    }
  }, [isDemoMode]);

  const fetchRecentActivities = useCallback(async () => {
    // Only fetch for non-demo users if you don't have a demo-specific mock endpoint
    if (isDemoMode) {
      setRecentActivities([
        { id: 1, type: 'SUCCESS', description: 'Dr. Smith updated a clinical note.', date: '5 min ago' },
        { id: 2, type: 'INFO', description: 'Patient 104 registered.', date: '1 hour ago' },
        { id: 3, type: 'CRITICAL', description: 'Database connection error.', date: '2 hours ago' },
        { id: 4, type: 'LOGIN', description: 'Receptionist Jane logged in.', date: '3 hours ago' },
      ]);
      return;
    }
    
    // Placeholder for real API call
    setRecentActivities([]);
  }, [isDemoMode]);

  const fetchAppointmentStatusCounts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}${getApiPrefix()}/admin/appointment-status-counts`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const labels = data.map(item => item.status);
      const counts = data.map(item => parseInt(item.count, 10));

      setPieChartData(prevData => ({
        ...prevData,
        labels: labels,
        datasets: prevData.datasets.map(dataset => ({ ...dataset, data: counts })),
      }));

    } catch (error) {
      console.error('Error fetching appointment status counts:', error);
      if (isDemoMode) {
        setPieChartData(prevData => ({
            ...prevData,
            labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
            datasets: prevData.datasets.map(dataset => ({ ...dataset, data: [150, 450, 50, 20] })),
        }));
      }
    }
  }, [token, isDemoMode]);

  const fetchDepartmentsCount = useCallback(async () => {
    if (isDemoMode) {
      setTotalDepartments(15);
    } else {
      // Placeholder for real API call
      setTotalDepartments(0);
    }
  }, [isDemoMode]);


  useEffect(() => {
    if (isAuthenticated || isDemoMode) {
      fetchAdminDashboardData();
      fetchTodaysAppointments();
      fetchAppointmentStatusCounts();
      fetchRecentActivities();
      fetchDepartmentsCount();
    }
  }, [isAuthenticated, isDemoMode, fetchAdminDashboardData, fetchTodaysAppointments, fetchAppointmentStatusCounts, fetchRecentActivities, fetchDepartmentsCount]);

  const getActivityBadgeClasses = (type) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200';
      case 'CRITICAL': return 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200';
      case 'LOGIN': return 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
      case 'INFO':
      default: return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
    }
  };

  // --- JSX Rendering ---
  if (authLoading || isLoading) {
    return <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Loading Dashboard Data...</div>;
  }
  
  const CARD_VARIANTS = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };
  const isDemo = isDemoMode || user?.role === 'guest_demo';
  
  const dashboardTitle = isDemo ? 'Demo Dashboard' : `${user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{dashboardTitle}</h1>
        <p className="text-md">Welcome, {user?.first_name || user?.username || 'User'}! Today is {currentDate}.</p>
      </header>
      
      {/* 1. Conditional Demo Mode Alert */}
      {isDemo && <DemoModeAlert theme={theme} />}

      {/* 2. Statistics Cards - Conditional Rendering based on role */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Card 1: Patients */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ scale: 1.03 }}
          className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <Users className="h-8 w-8 text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Total Patients</h3>
          <p className="text-4xl font-extrabold text-blue-500">{stats.totalPatients.toLocaleString()}</p>
          <Link to="/patients" className="text-sm text-blue-400 hover:underline mt-2 block">View Patients List</Link>
        </motion.div>
        
        {/* Card 2: Doctors/Staff */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ scale: 1.03 }}
          className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <Users className="h-8 w-8 text-green-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Total Doctors</h3>
          <p className="text-4xl font-extrabold text-green-500">{stats.totalDoctors.toLocaleString()}</p>
          <Link to="/users" className="text-sm text-green-400 hover:underline mt-2 block">View Staff Directory</Link>
        </motion.div>

        {/* Card 3: Today's Appointments */}
        <motion.div
          variants={CARD_VARIANTS}
          whileHover={{ scale: 1.03 }}
          className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <CalendarCheck className="h-8 w-8 text-yellow-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Today's Appointments</h3>
          <p className="text-4xl font-extrabold text-yellow-500">{stats.todaysAppointments.toLocaleString()}</p>
          <Link to="/appointments" className="text-sm text-yellow-400 hover:underline mt-2 block">View Schedule</Link>
        </motion.div>

        {/* Card 4: Revenue (Admin/Receptionist) or Departments (Demo/Guest) */}
        {!isDemo && user?.role !== 'receptionist' ? ( // Show Revenue for Admin only
            <motion.div
                variants={CARD_VARIANTS}
                whileHover={{ scale: 1.03 }}
                className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
                <DollarSign className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="text-lg font-semibold mb-1">Monthly Revenue</h3>
                <p className="text-4xl font-extrabold text-purple-500">${stats.revenueSummary.toLocaleString()}</p>
                <span className="text-sm text-gray-400 mt-2 block">Simulated Data</span>
            </motion.div>
        ) : ( // Show Departments for Demo/Receptionist/Guest
            <motion.div
                variants={CARD_VARIANTS}
                whileHover={{ scale: 1.03 }}
                className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
                <Briefcase className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="text-lg font-semibold mb-1">Total Departments</h3>
                <p className="text-4xl font-extrabold text-purple-500">{totalDepartments.toLocaleString()}</p>
                <Link to="/departments" className="text-sm text-purple-400 hover:underline mt-2 block">View Departments</Link>
            </motion.div>
        )}
      </motion.div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className={`lg:col-span-2 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="h-96 flex flex-col justify-center items-center">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments List */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Next Scheduled Appointments</h3>
          <ul className="space-y-3">
            {todaysAppointmentsList.length > 0 ? (
              todaysAppointmentsList.slice(0, 5).map(appointment => (
                // Assuming appointment object has patient_name, doctor_name, and appointment_time
                <motion.li 
                    key={appointment.id} 
                    className={`p-3 rounded-md flex justify-between items-center transition duration-200 hover:shadow-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                  <div>
                    <span className="font-medium text-blue-500 dark:text-blue-400">{appointment.patient_name || 'Patient'}</span>
                    {/* Only display doctor name if it exists or if not in demo mode (where the structure might be simplified) */}
                    {appointment.doctor_name && <p className="text-xs text-gray-500 dark:text-gray-400">w/ {appointment.doctor_name}</p>}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{appointment.appointment_time}</span>
                </motion.li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400 text-center py-4">No appointments scheduled for today.</li>
            )}
          </ul>
          <div className="mt-4 text-center border-t pt-3 border-gray-200 dark:border-gray-700">
            <Link to="/appointments" className="text-blue-500 hover:text-blue-400 font-medium text-sm">View Full Schedule &rarr;</Link>
          </div>
        </div>

        {/* Recent Activities/Audit Log - Only shown for non-demo users */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{isDemo ? 'System Financial Summary' : 'Recent System Activity'}</h3>
          
          {isDemo ? (
            // Demo Mode Content: Financial Summary
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-green-50 dark:bg-green-900/50">
                    <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                        <span className="font-medium text-green-700 dark:text-green-300">Monthly Revenue (Simulated)</span>
                    </div>
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">${stats.revenueSummary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-blue-50 dark:bg-blue-900/50">
                    <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">Total Active Users</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{(stats.totalDoctors + 5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-red-50 dark:bg-red-900/50">
                    <div className="flex items-center">
                        <ShieldAlert className="h-5 w-5 text-red-600 mr-3" />
                        <span className="font-medium text-red-700 dark:text-red-300">Critical Alerts</span>
                    </div>
                    <span className="text-xl font-bold text-red-700 dark:text-red-300">3</span>
                </div>
            </div>
          ) : (
            // Admin/Receptionist Content: Recent Activities
            <ul className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map(activity => (
                  <motion.li 
                    key={activity.id} 
                    className={`p-3 rounded-md flex justify-between items-center cursor-pointer transition duration-150 hover:shadow-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <p className='text-gray-800 dark:text-gray-200 font-medium text-base leading-snug'>{activity.description}</p>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getActivityBadgeClasses(activity.type)}`}>{activity.type}</span>
                        {activity.date}
                      </p>
                    </div>
                  </motion.li>
                ))
              ) : (
                <li className='py-4 text-gray-500 dark:text-gray-400 text-center'>No recent activities to display.</li>
              )}
              <div className='mt-5 text-center border-t pt-3 border-gray-200 dark:border-gray-700'>
                <Link to='/activities' className='text-blue-500 hover:text-blue-400 font-medium text-sm'>
                  {isDemo ? 'Explore Clinical Data \u2192' : 'View Full Activity Log \u2192'}
                </Link>
              </div>
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AdminDashboardPage;