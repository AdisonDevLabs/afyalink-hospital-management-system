import React, { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, Home, Briefcase, KeyRound, Save, XCircle, Edit3, Loader2, Calendar, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FaUserCircle } from 'react-icons/fa';

// Reusable Field Component
import ProfileField from '../components/common/ProfileField';

import { useUserService } from '../hooks/useUserService';
import { useAuth } from '../context/AuthContext';


const apiBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const DEFAULT_AVATAR_URL = '/profile_picture/default-image.webp'

function UserProfile() {
  const { user, token, loading: authLoading, logout, login } = useAuth();
  const navigate = useNavigate();

  const { isLoading, fetchProfile, editProfile } = useUserService();

  // Initialize state with all required and updatable fields
  const [profileData, setProfileData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    gender: '',
    specialization: '',
    role: '',
    profile_picture: DEFAULT_AVATAR_URL, // Use a default for rendering
  });

  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState(''); // Separate state for password change
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const fetchUserProfileData = async () => {
      if (authLoading) {
        return;
      }
      try {
        const data = await fetchProfile();

        // Ensure all keys are present, even if empty, for state consistency
        const sanitizedData = {
            ...profileData, // Start with defaults
            ...data,
            profile_picture: data.profile_picture
        };

        setProfileData(sanitizedData);
        setOriginalProfileData(sanitizedData);
        toast.success('Profile loaded successfully');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(error.message || 'Failed to load profile. Please try again.');
      }
    };

    fetchUserProfileData();
    
    // Cleanup URL object if a file was selected but navigation occurred
    return () => {
        if (selectedFile) {
            URL.revokeObjectURL(profileData.profile_picture);
        }
    }
  }, [authLoading]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create local URL for immediate image preview
      const previewUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        profile_picture: previewUrl,
      }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    toast.dismiss();

    if (!user) {
      toast.error('User not authenticated. Cannot save profile.');
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Fields that are updatable (excluding profile_picture and password handled separately)
      const updatableTextualFields = [
        'first_name', 'last_name', 'email', 'phone_number', 
        'address', 'date_of_birth', 'gender', 'specialization'
      ];
      
      // 1. Append textual fields
      updatableTextualFields.forEach(key => {
        // Only append if the value is different from the original OR if the original was empty (to allow setting data)
        if (profileData[key] !== originalProfileData[key] || (profileData[key] && !originalProfileData[key])) {
             formData.append(key, profileData[key]);
        }
      });
      
      // 2. Append password if changed/provided
      if (password) {
          formData.append('password', password);
      }
      
      // 3. Append file if selected
      if (selectedFile) {
        // 'profilePic' must match the field name used in Multer middleware (if applicable)
        formData.append('profilePic', selectedFile); 
      }
      
      // Check if any actual data was added to the form
      if (!Array.from(formData.keys()).length) {
          toast('No changes detected. Nothing to save.', { icon: 'ℹ️' });
          setIsSaving(false);
          setIsEditing(false);
          return;
      }

      // Call APIAPI
      const responseData = await editProfile(formData);
      
      const updatedUserData = responseData.user;

      console.log(updatedUserData);
      // Update contexts and states
      login(updatedUserData);
      setProfileData(prevData => ({ ...prevData, ...updatedUserData }));
      setOriginalProfileData(prevData => ({ ...prevData, ...updatedUserData }));
      
      // Clean up local states
      setSelectedFile(null);
      setPassword('');
      
      // If we used a local URL for preview, revoke it now
      if(profileData.profile_picture.startsWith('blob:')) {
          URL.revokeObjectURL(profileData.profile_picture);
      }


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
    // Revert to original data, clearing any local file preview
    setProfileData(originalProfileData);
    setSelectedFile(null);
    setPassword('');
    setIsEditing(false);
    toast.dismiss();
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  // URL for the profile picture (either local preview or backend URL)
  const finalProfilePictureUrl = profileData.profile_picture.startsWith('/uploads/profile_pictures') 
    ? `${apiBackendUrl}${profileData.profile_picture}`
    : profileData.profile_picture;


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
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 md:p-10 w-full max-w-5xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center border-b pb-4 border-gray-200 dark:border-gray-700">
          My Profile
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
            
          {/* --- Left Column: Identity, Picture & Role --- */}
          <div className="flex-shrink-0 lg:w-1/3 flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
            
            {/* Profile Picture */}
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-lg group mb-4">
              <img
                src={finalProfilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }} // Fallback on error
              />

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
            
            {/* Primary Info */}
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1 text-center">
              {profileData.first_name && profileData.last_name
                ? `${capitalize(profileData.first_name)} ${capitalize(profileData.last_name)}`
                : capitalize(profileData.username)}
            </h3>
            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-4 flex items-center">
              <KeyRound size={20} className="mr-2" />
              {profileData.role ? capitalize(profileData.role) : 'N/A'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Username: {profileData.username}</p>
          </div>
          
          {/* --- Right Column: Details and Form --- */}
          <div className="lg:w-2/3">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

              {/* Action Buttons (Top Right of Form) */}
              <div className="flex justify-end space-x-4 mb-6">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
                  >
                    <Edit3 className="mr-2 h-5 w-5" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-6 py-3 border text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-300"
                      disabled={isSaving}
                    >
                      <XCircle className="mr-2 h-5 w-5" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Profile Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                
                {/* 1. Name */}
                <ProfileField label="First Name" name="first_name" value={profileData.first_name} onChange={handleInputChange} isEditing={isEditing} iconName="user" />
                <ProfileField label="Last Name" name="last_name" value={profileData.last_name} onChange={handleInputChange} isEditing={isEditing} iconName="user" />

                {/* 2. Contact */}
                <ProfileField label="Email" name="email" value={profileData.email} onChange={handleInputChange} isEditing={isEditing} type="email" iconName="email" />
                <ProfileField label="Phone Number" name="phone_number" value={profileData.phone_number} onChange={handleInputChange} isEditing={isEditing} iconName="phone_number" />

                {/* 3. Address and Personal */}
                <div className="md:col-span-2">
                    <ProfileField label="Address" name="address" value={profileData.address} onChange={handleInputChange} isEditing={isEditing} type="textarea" iconName="address" />
                </div>
                <ProfileField label="Date of Birth" name="date_of_birth" value={profileData.date_of_birth} onChange={handleInputChange} isEditing={isEditing} type="date" iconName="date_of_birth" />
                <ProfileField label="Gender" name="gender" value={profileData.gender} onChange={handleInputChange} isEditing={isEditing} iconName="gender" />
                
                {/* 4. Professional (Optional/Role-based) */}
                {(profileData.role === 'doctor' || profileData.role === 'nurse') && (
                    <ProfileField label="Specialization" name="specialization" value={profileData.specialization} onChange={handleInputChange} isEditing={isEditing} iconName="specialization" />
                )}

                {/* 5. Password Change (Always visible when editing) */}
                {isEditing && (
                    <div className="md:col-span-2 pt-4 border-t dark:border-gray-700">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <Lock size={16} className="mr-2 text-red-500" />
                            New Password (Leave blank to keep current)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 bg-white dark:bg-gray-800"
                        />
                    </div>
                )}
                
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
