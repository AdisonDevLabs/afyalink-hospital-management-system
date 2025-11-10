// client/src/features/dashboards/components/MetricCard.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

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
        <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} group-hover:scale-110 transition-transform dark:${colorClass.replace('text-', 'bg-').replace('600', '900')} dark:${colorClass.replace('600', '400')}`}>
          <Icon className="h-8 w-8" />
        </div>
      )}
    </div>
    {link && (
      <Link to={link} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group transition duration-200 mt-2 text-sm dark:text-blue-400 dark:hover:text-blue-300">
        {linkText}
        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
      </Link>
    )}
  </motion.div>
);

export default MetricCard;