import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}

function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todaysAppointments: 0,
    revenueSummary: 0,
    // Add more stats as needed
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysAppointmentsList, setTodaysAppointmentsList] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Appointments',
        data: [65, 59, 80, 81, 56, 55, 40, 60, 70, 75, 85, 90], // Dummy data
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  // State for Pie Chart Data
  const [pieChartData, setPieChartData] = useState({
    labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    }],
  });


  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch admin stats
  const fetchAdminStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Optionally set an error state to display to the user
    }
  };

  // Fetch today's appointments for the list
  const fetchTodaysAppointments = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${backendUrl}/api/appointments?date=${today}&status=Scheduled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodaysAppointmentsList(data);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    }
  }, [token]);

  // New function to fetch appointment status counts for the pie chart
  const fetchAppointmentStatusCounts = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/admin/appointment-status-counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Map the fetched data to pie chart format
      const labels = data.map(item => item.status);
      const counts = data.map(item => parseInt(item.count, 10));

      // Define a consistent set of background and border colors for known statuses
      const statusColors = {
        'Scheduled': { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
        'Completed': { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
        'Cancelled': { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },
        'Rescheduled': { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' },
        'Pending': { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
        // Add more as needed
      };

      const backgroundColors = labels.map(label => statusColors[label]?.bg || 'rgba(128, 128, 128, 0.6)');
      const borderColors = labels.map(label => statusColors[label]?.border || 'rgba(128, 128, 128, 1)');


      setPieChartData({
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        }],
      });

    } catch (error) {
      console.error('Error fetching appointment status counts:', error);
    }
  }, [token]);


  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      // In a real application, you'd fetch this from your backend
      // For now, we'll use dummy data
      const dummyActivities = [
        { id: 1, description: 'Dr. Smith completed an appointment with Jane Doe.', type: 'appointment', date: '2025-07-09' },
        { id: 2, description: 'New patient John Smith registered.', type: 'registration', date: '2025-07-08' },
        { id: 3, description: 'System update completed successfully.', type: 'system', date: '2025-07-07' },
        { id: 4, description: 'Appointment with Emily White rescheduled.', type: 'appointment', date: '2025-07-06' },
      ];
      setRecentActivities(dummyActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  }, [token]);


  useEffect(() => {

    if (authLoading) {
      // Still loading authentication, do nothing yet
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch data only if authenticated and token is available
    if (user && token) {
      fetchAdminStats();
      fetchTodaysAppointments();
      fetchAppointmentStatusCounts(); // Call the new fetch function for pie chart
      fetchRecentActivities();
    }
  }, [isAuthenticated, authLoading, user, token, navigate, fetchTodaysAppointments, fetchRecentActivities, fetchAppointmentStatusCounts]);

  // Framer Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  };

  const getActivityBadgeClasses = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-200 text-blue-800';
      case 'registration':
        return 'bg-green-200 text-green-800';
      case 'system':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      className='min-h-screen bg-gray-100 p-6'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.div variants={itemVariants} className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Welcome, {user ? user.first_name : 'User'}!
        </h1>
        {/* Display the current date as "today is..." */}
        <p className='text-gray-600 mt-1'>Today is {currentDate}</p>
      </motion.div>

      {/* Stats Cards */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className='bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-b-4 border-blue-500'
        >
          <div>
            <p className='text-gray-500 text-sm font-medium'>Total Patients</p>
            <h2 className='text-3xl font-bold text-gray-800 mt-1'>{stats.totalPatients}</h2>
          </div>
          <svg className='h-10 w-10 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H9m6 0a2 2 0 012-2H7a2 2 0 012 2m0 0l-1.583 2.083A4 4 0 0112 21.001M12 4.354a4 4 0 100 5.292M12 4.354C12 3.504 12 2 12 2s-1.504 0-2 0'></path>
          </svg>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className='bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-b-4 border-green-500'
        >
          <div>
            <p className='text-gray-500 text-sm font-medium'>Total Doctors</p>
            <h2 className='text-3xl font-bold text-gray-800 mt-1'>{stats.totalDoctors}</h2>
          </div>
          <svg className='h-10 w-10 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.023 12.023 0 002 9c0 5.591 3.824 10.29 9 11.682 3.14-.943 5.864-2.583 7.935-4.577.674-.683 1.25-1.423 1.737-2.228.536-.87.91-1.794 1.104-2.784.2-.99-.074-1.921-.77-2.735z'></path>
          </svg>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className='bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-b-4 border-yellow-500'
        >
          <div>
            <p className='text-gray-500 text-sm font-medium'>Today's Appointments</p>
            <h2 className='text-3xl font-bold text-gray-800 mt-1'>{stats.todaysAppointments}</h2>
          </div>
          <svg className='h-10 w-10 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
          </svg>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className='bg-white rounded-lg shadow-md p-6 flex items-center justify-between border-b-4 border-purple-500'
        >
          <div>
            <p className='text-gray-500 text-sm font-medium'>Revenue Summary (Monthly)</p>
            <h2 className='text-3xl font-bold text-gray-800 mt-1'>${stats.revenueSummary.toLocaleString()}</h2>
          </div>
          <svg className='h-10 w-10 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h.01M17 13l-4-4m4 4l-4 4m0 0V5'></path>
          </svg>
        </motion.div>
      </section>

      {/* Charts and Recent Activities */}
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Monthly Appointments Chart */}
        <motion.div variants={itemVariants} className='lg:col-span-2 bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Monthly Appointments</h3>
          <div className='h-80'>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Appointment Trends',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Appointment Status Pie Chart */}
        <motion.div variants={itemVariants} className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Appointment Status Distribution</h3>
          <div className='h-80 flex items-center justify-center'>
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  title: {
                    display: true,
                    text: 'Current Appointment Statuses',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.section variants={itemVariants} className='lg:col-span-3 bg-white rounded-lg shadow-md p-6 mt-6'> {/* Adjusted col-span to fill row below charts */}
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Recent Activities</h3>
          <ul className='divide-y divide-gray-200'>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <motion.li variants={itemVariants} key={activity.id} className='flex items-center justify-between py-4'>
                  <div>
                    <p className='text-gray-800 font-medium text-base leading-snug'>{activity.description}</p>
                    <p className='text-sm text-gray-500 mt-1'>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getActivityBadgeClasses(activity.type)}`}>
                        {activity.type}
                      </span>
                      {activity.date}
                    </p>
                  </div>
                  <div className='text-gray-400'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
                    </svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className='py-4 text-gray-500 text-center'>
                No recent activities to display.
              </motion.li>
            )}
          </ul>
          {recentActivities.length > 0 && (
            <motion.div variants={itemVariants} className='mt-5 text-right'>
              <Link to='/activities' className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200'>
                View All Activities &rarr;
              </Link>
            </motion.div>
          )}
        </motion.section>
      </section>
    </motion.div>
  );
}

export default DashboardPage;