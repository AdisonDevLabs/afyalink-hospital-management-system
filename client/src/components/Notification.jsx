// client/src/components/Notification.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';
  const iconColor = type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y:-50, x: "-50%" }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg dark:shadow-none flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className={`absolute top-1 right-1 ${iconColor} hover:text-gray-900 dark:hover:text-gray-100`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

export default Notification;