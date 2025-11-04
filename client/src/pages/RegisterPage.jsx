// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus, User, Lock, CheckCircle, AlertCircle, Info, Mail, Phone, Home,
  Calendar, CreditCard, Image // Added new icons for relevant fields
} from 'lucide-react'; // Import new icons
import { motion } from 'framer-motion';

// --- Framer Motion Animation Variants (Copied/Adapted from LoginPage) ---

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: "easeIn" } }
};

const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.08,
      type: "spring",
      stiffness: 120,
      damping: 15
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
  exit: { opacity: 0, y: -10 }
};

// --- End Framer Motion Animation Variants ---

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient'); // Default to patient

  // New states for patient-specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState(''); // For a URL, or consider file upload if needed

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      setLoading(false);
      return;
    }

    // Basic client-side validation for required patient fields if role is patient
    if (role === 'patient') {
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactPhone) {
            setError('Please fill in all required patient details (First Name, Last Name, Date of Birth, Gender, Contact Phone).');
            setLoading(false);
            return;
        }
    }


    try {
      const response = await fetch(`${backendUrl}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role,
          // Include all patient-specific fields in the request body
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          gender,
          national_id: nationalId,
          contact_phone: contactPhone,
          email,
          address,
          photo_url: photoUrl,
          // specialization is not needed for patients, but if you had doctors, you'd send it conditionally
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful! You will be redirected to the login page shortly.');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(data.message || 'Registration failed. Please review your details and try again.');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Network error: Could not connect to the server. Please check your internet connection or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 p-4 font-sans antialiased"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl dark:shadow-blue-900/50 w-full max-w-md border border-gray-100 dark:border-gray-700"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="bg-blue-600 dark:bg-blue-500 p-3 rounded-full shadow-lg mb-4"
            variants={itemVariants}
          >
            <UserPlus className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-3 tracking-tight"
            variants={itemVariants}
          >
            Create Your Account
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-base sm:text-lg text-center"
            variants={itemVariants}
          >
            Join AfyaLink HMS for seamless healthcare management.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Role Selection (Keep it at the top or bottom as per design choice) */}
          <motion.div variants={itemVariants}>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Registering As:
            </label>
            <div className="relative">
              <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm appearance-none transition-all duration-200"
              >
                <option value="patient">Patient</option>
                <option value="guest">Guest</option>
                {/* You can add 'doctor' here if doctors can also self-register with their own specific fields */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Conditional Rendering for Patient Fields */}
          {role === 'patient' && (
            <>
              <motion.div variants={itemVariants}>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required // Make required if patient
                    placeholder="e.g., Jane"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required // Make required if patient
                    placeholder="e.g., Doe"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required // Make required if patient
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required // Make required if patient
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm appearance-none transition-all duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  National ID
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id="nationalId"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g., 12345678"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required // Make required if patient
                    placeholder="e.g., +1234567890"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Address
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, Anytown"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Photo URL (Optional)
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="url" // Use type "url" for photo URL
                    id="photoUrl"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
                  />
                </div>
              </motion.div>
            </>
          )}

          {/* Username (always required) */}
          <motion.div variants={itemVariants}>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g., john.doe"
                className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
              />
            </div>
          </motion.div>

          {/* Password (always required) */}
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
              />
            </div>
          </motion.div>

          {/* Confirm Password (always required) */}
          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm transition-all duration-200 hover:border-blue-500"
              />
            </div>
          </motion.div>


          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition-all duration-300 transform
            ${
              loading
                ? 'bg-blue-400 dark:bg-blue-700 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </motion.button>
        </form>

        {message && (
          <motion.div
            className="mt-6 flex items-center p-4 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 text-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={messageVariants}
          >
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{message}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            className="mt-6 flex items-center p-4 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 text-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={messageVariants}
          >
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <motion.div
          className="mt-8 text-center pt-4 border-t border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
              Login here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default RegisterPage;