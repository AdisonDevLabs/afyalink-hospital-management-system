import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, todaysAppointments: 0, revenueSummary: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysAppointmentsList, setTodaysAppointmentsList] = useState([]);

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

  const fetchAdminStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/v1/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }, [token]);

  const fetchTodaysAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${backendUrl}/api/v1/appointments?date=${today}&status=Scheduled`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTodaysAppointmentsList(data);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    }
  }, [token]);

  const fetchAppointmentStatusCounts = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/v1/admin/appointment-status-counts`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const labels = data.map(item => item.status);
      const counts = data.map(item => parseInt(item.count, 10));

      const isDarkMode = theme === 'dark';
      const colors = getChartColors(isDarkMode);

      const dynamicStatusColors = {
        'Scheduled': { bg: colors.pieChartBackgrounds[0], border: colors.pieChartBorders[0] },
        'Completed': { bg: colors.pieChartBackgrounds[1], border: colors.pieChartBorders[1] },
        'Cancelled': { bg: colors.pieChartBackgrounds[2], border: colors.pieChartBorders[2] },
        'Rescheduled': { bg: colors.pieChartBackgrounds[3], border: colors.pieChartBorders[3] },
        'Pending': { bg: isDarkMode ? 'rgba(153, 102, 255, 0.4)' : 'rgba(153, 102, 255, 0.6)', border: isDarkMode ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 1)' },
      };

      const backgroundColors = labels.map(label => dynamicStatusColors[label]?.bg || (isDarkMode ? 'rgba(128, 128, 128, 0.4)' : 'rgba(128, 128, 128, 0.6)'));
      const borderColors = labels.map(label => dynamicStatusColors[label]?.border || (isDarkMode ? 'rgba(128, 128, 128, 0.8)' : 'rgba(128, 128, 128, 1)'));

      setPieChartData({ labels, datasets: [{ data: counts, backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 1 }] });
    } catch (error) {
      console.error('Error fetching appointment status counts:', error);
    }
  }, [token, theme, getChartColors]);

  const fetchRecentActivities = useCallback(async () => {
    if (!token) return;
    // Using dummy data as per original implementation
    const dummyActivities = [
      { id: 1, description: 'Dr. Smith completed an appointment with Jane Doe.', type: 'appointment', date: '2025-07-09' },
      { id: 2, description: 'New patient John Smith registered.', type: 'registration', date: '2025-07-08' },
      { id: 3, description: 'System update completed successfully.', type: 'system', date: '2025-07-07' },
      { id: 4, description: 'Appointment with Emily White rescheduled.', type: 'appointment', date: '2025-07-06' },
    ];
    setRecentActivities(dummyActivities);
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && token) {
      fetchAdminStats();
      fetchTodaysAppointments();
      fetchAppointmentStatusCounts();
      fetchRecentActivities();
    }
  }, [isAuthenticated, authLoading, user, token, navigate, fetchTodaysAppointments, fetchRecentActivities, fetchAppointmentStatusCounts, fetchAdminStats]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };
  const cardVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 }, hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' } };

  const getActivityBadgeClasses = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-200 text-blue-800';
      case 'registration': return 'bg-green-200 text-green-800';
      case 'system': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      className='min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-300'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.div variants={itemVariants} className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100'>Welcome, {user ? user.first_name : 'User'}!</h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>Today is {currentDate}</p>
      </motion.div>

      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <motion.div variants={cardVariants} whileHover='hover' className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 flex items-center justify-between border-b-4 border-blue-500'>
          <div><p className='text-gray-500 dark:text-gray-300 text-sm font-medium'>Total Patients</p><h2 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1'>{stats.totalPatients}</h2></div>
          <svg className='h-10 w-10 text-blue-500 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H9m6 0a2 2 0 012-2H7a2 2 0 012 2m0 0l-1.583 2.083A4 4 0 0112 21.001M12 4.354a4 4 0 100 5.292M12 4.354C12 3.504 12 2 12 2s-1.504 0-2 0'></path></svg>
        </motion.div>

        <motion.div variants={cardVariants} whileHover='hover' className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 flex items-center justify-between border-b-4 border-green-500'>
          <div><p className='text-gray-500 dark:text-gray-300 text-sm font-medium'>Total Doctors</p><h2 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1'>{stats.totalDoctors}</h2></div>
          <svg className='h-10 w-10 text-green-500 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.023 12.023 0 002 9c0 5.591 3.824 10.29 9 11.682 3.14-.943 5.864-2.583 7.935-4.577.674-.683 1.25-1.423 1.737-2.228.536-.87.91-1.794 1.104-2.784.2-.99-.074-1.921-.77-2.735z'></path></svg>
        </motion.div>

        <motion.div variants={cardVariants} whileHover='hover' className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 flex items-center justify-between border-b-4 border-yellow-500'>
          <div><p className='text-gray-500 dark:text-gray-300 text-sm font-medium'>Today's Appointments</p><h2 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1'>{stats.todaysAppointments}</h2></div>
          <svg className='h-10 w-10 text-yellow-500 dark:text-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path></svg>
        </motion.div>

        <motion.div variants={cardVariants} whileHover='hover' className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 flex items-center justify-between border-b-4 border-purple-500'>
          <div><p className='text-gray-500 dark:text-gray-300 text-sm font-medium'>Revenue Summary (Monthly)</p><h2 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1'>${stats.revenueSummary.toLocaleString()}</h2></div>
          <svg className='h-10 w-10 text-purple-500 dark:text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h.01M17 13l-4-4m4 4l-4 4m0 0V5'></path></svg>
        </motion.div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <motion.div variants={itemVariants} className='lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6'>
          <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>Monthly Appointments</h3>
          <div className='h-80'><Bar data={chartData} options={chartOptions} /></div>
        </motion.div>

        <motion.div variants={itemVariants} className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6'>
          <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>Appointment Status Distribution</h3>
          <div className='h-80 flex items-center justify-center'><Pie data={pieChartData} options={pieChartOptions} /></div>
        </motion.div>

        <motion.section variants={itemVariants} className='lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 mt-6'>
          <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>Recent Activities</h3>
          <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <motion.li variants={itemVariants} key={activity.id} className='flex items-center justify-between py-4'>
                  <div>
                    <p className='text-gray-800 dark:text-gray-200 font-medium text-base leading-snug'>{activity.description}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getActivityBadgeClasses(activity.type)}`}>{activity.type}</span>
                      {activity.date}
                    </p>
                  </div>
                  <div className='text-gray-400 dark:text-gray-500'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path></svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className='py-4 text-gray-500 dark:text-gray-400 text-center'>No recent activities to display.</motion.li>
            )}
          </ul>
          {recentActivities.length > 0 && (
            <motion.div variants={itemVariants} className='mt-5 text-right'>
              <Link to='/activities' className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200'>View All Activities &rarr;</Link>
            </motion.div>
          )}
        </motion.section>
      </section>
    </motion.div>
  );
}
export default DashboardPage;