import React from 'react';

const FormField = ({ label, name, value, onChange, type = 'text', readOnly = false, error }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        rows="3"
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${readOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${readOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      />
    )}
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

export default FormField;