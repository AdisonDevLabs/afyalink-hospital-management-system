import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Stethoscope, BriefcaseMedical } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const ITEM_VARIANTS = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function GuestDashboardPage() {
  const { user } = useAuth();

  const dashboards = [
    {
      title: 'Admin Dashboard',
      description: 'View system-wide statistics, user management, and overall hospital performance.',
      icon: LayoutDashboard,
      path: '/dashboard/admin',
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Doctor Dashboard',
      description: 'View doctor-specific metrics, patient appointments, and clinical insights.',
      icon: Stethoscope,
      path: '/dashboard/doctor',
      borderColor: 'border-green-500',
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Nurse Dashboard',
      description: 'View admitted patients, nursing tasks, and ward status.',
      icon: BriefcaseMedical,
      path: '/dashboard/nurse',
      borderColor: 'border-purple-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Receptionist Dashboard',
      description: 'View front-desk operations, daily appointments, and patient registration.',
      icon: Users,
      path: '/dashboard/receptionist',
      borderColor: 'border-yellow-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      <header className="mb-12 text-center mt-10">
        <motion.h1 variants={ITEM_VARIANTS} className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Guest Access Portal
        </motion.h1>
        <motion.p variants={ITEM_VARIANTS} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Welcome, {user?.first_name || 'Guest'}. You have read-only access to explore the various role-based dashboards across the AfyaLink system. Please select a dashboard to view.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {dashboards.map((dashboard, index) => {
          const Icon = dashboard.icon;
          return (
            <motion.div key={index} variants={ITEM_VARIANTS}>
              <Link to={dashboard.path} className="block group h-full">
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border-t-4 ${dashboard.borderColor} hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dashboard.title}
                    </h2>
                    <div className={`p-3 ${dashboard.iconBg} rounded-full`}>
                      <Icon className={`h-8 w-8 ${dashboard.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 flex-grow">
                    {dashboard.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    Access Dashboard <span className="ml-2 group-hover:translate-x-2 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default GuestDashboardPage;