// client/src/components/FormComponents.jsx

import React from 'react';

export const FormInput = ({ label, id, type = 'tetx', value, onChange, placeholder, required = false, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}:
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${className}`}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  </div>
);

export const FormSelect = ({ label, id, value, onChange, options, required = false, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
      {label} {required && <span className="text-red-500">*</span>}:
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white dark:bg-gray-700 dark:text-gray-200 ${className}`}
      required={required}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export const FormTextArea = ({ label, id, value, onChange, placeholder, rows = '3', className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
      {label}:
    </label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white dark:bg-gray-600 dark:text-gray-200 ${className}`}
      placeholder={placeholder}
      {...props}
    ></textarea>
  </div>
);