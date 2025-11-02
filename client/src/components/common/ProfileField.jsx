import React from 'react';
import { Mail, Phone, Home, Calendar, Users, Briefcase } from 'lucide-react';

const iconMap = {
  email: Mail,
  phone_number: Phone,
  address: Home,
  date_of_birth: Calendar,
  gender: Users,
  specialization: Briefcase,
};

const ProfileField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  isEditing, 
  type = 'text',
  placeholder = '',
  iconName // 'email', 'phone_number', etc.
}) => {
  const Icon = iconMap[iconName] || Users;
  
  // Convert date string to YYYY-MM-DD format for input[type=date]
  const displayValue = type === 'date' && value ? value.split('T')[0] : value;

  // Render logic for different input types
  const renderInput = () => {
    if (name === 'address' && isEditing) {
      return (
        <textarea
          id={name}
          name={name}
          value={displayValue || ''}
          onChange={onChange}
          rows="3"
          placeholder={placeholder}
          className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 bg-white dark:bg-gray-800`}
        />
      );
    }

    // Default input type (text, email, date, etc.)
    return (
      <input
        type={type}
        id={name}
        name={name}
        value={displayValue || ''}
        onChange={onChange}
        readOnly={!isEditing}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${
          isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium'
        }`}
      />
    );
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
        <Icon size={16} className={`mr-2 ${isEditing ? 'text-blue-500' : 'text-gray-400'}`} />
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default ProfileField;
