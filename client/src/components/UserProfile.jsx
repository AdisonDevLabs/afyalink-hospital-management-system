import React, { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, Home, Briefcase, KeyRound, Save, XCircle, Edit3, Loader2 } from 'lucide-react'; // More icons for richer UI
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast'; // For modern toast notifications

function UserProfile() {
  const { user, token, loading: authLoading, logout, login } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    role: '',
    profile_picture: '',
    username: '',
  });

  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving changes

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiBackendUrl = backendUrl.replace('/api', '');


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !token) {
        console.warn('UserProfile: Not authenticated. Redirecting to login.');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      toast.dismiss(); // Clear any previous toasts

      try {
        const response = await fetch(`${backendUrl}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate('/login', { replace: true });
            toast.error('Session expired. Please log in again.');
            throw new Error('Unauthorized: Session expired. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile data.');
        }

        const data = await response.json();
        setProfileData(data);
        setOriginalProfileData(data);
        toast.success('Profile loaded successfully!');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(error.message || 'Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, token, authLoading, backendUrl, navigate, logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData((prevData) => ({
          ...prevData,
          profile_picture: event.target.result, // Data URL for preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    toast.dismiss(); // Clear existing toasts

    if (!user || !token) {
      toast.error('User not authenticated. Cannot save profile.');
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== undefined && key !== 'profile_picture') {
          formData.append(key, profileData[key]);
        }
      }

      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }

      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login', { replace: true });
          throw new Error('Unauthorized: Session expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const responseData = await response.json();
      console.log('UserProfile - Full backend response after update:', responseData);
      console.log('UserProfile - User data passed to login:', responseData.user);
      
      const updatedUserData = responseData.user;

      login(updatedUserData, token);
      setProfileData(updatedUserData);
      setOriginalProfileData(updatedUserData);
      setSelectedFile(null);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalProfileData);
    setSelectedFile(null);
    setIsEditing(false);
    toast.dismiss(); // Clear any messages
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 h-10 w-10 mr-3" />
        <div className="text-blue-700 dark:text-blue-300 text-lg font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-10 w-full max-w-4xl transform transition-all duration-300 ease-in-out hover:shadow-3xl">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center border-b pb-4 border-gray-200 dark:border-gray-700">
          My Profile
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0 relative w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-lg group">
            {profileData.profile_picture ? (
              <img
                src={profileData.profile_picture.startsWith('/uploads/')
                ? `${apiBackendUrl}${profileData.profile_picture}`
                : profileData.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-blue-700 dark:text-blue-300 text-6xl font-bold">
                {profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : (profileData.username ? profileData.username.charAt(0).toUpperCase() : '?')}
              </span>
            )}
            {isEditing && (
              <label
                htmlFor="profile-picture-upload"
                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium"
                title="Change profile picture"
              >
                <Camera size={28} className="mb-1" />
                <span>Upload Photo</span>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Info Overview */}
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2">
              {profileData.first_name && profileData.last_name
                ? `${capitalize(profileData.first_name)} ${capitalize(profileData.last_name)}`
                : (profileData.username ? capitalize(profileData.username) : 'Guest User')}
            </h3>
            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center justify-center md:justify-start">
              <Briefcase size={20} className="mr-2" />
              {profileData.role ? capitalize(profileData.role) : 'Role Not Set'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-md">User ID: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm">{user?.id || 'N/A'}</span></p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <User size={20} className="mr-2 text-blue-500" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300'}`}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Mail size={20} className="mr-2 text-green-500" /> Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300'}`}
                />
              </div>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300'}`}
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                readOnly={!isEditing}
                rows="3"
                className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 ${isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-300'}`}
              ></textarea>
            </div>
          </div>

          {/* Role/Security Information Section (read-only) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <KeyRound size={20} className="mr-2 text-purple-500" /> Role & Access
            </h4>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={profileData.role ? capitalize(profileData.role) : 'N/A'}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed font-medium"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your role determines your access privileges within the system. This field cannot be edited.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105"
                  disabled={isSaving}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;