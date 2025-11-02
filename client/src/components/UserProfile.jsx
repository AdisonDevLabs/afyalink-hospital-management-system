import React, { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, Home, Briefcase, KeyRound, Save, XCircle, Edit3, Loader2, Calendar, Users, Lock, Trash2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

// Reusable Field Component
import ProfileField from '../components/common/ProfileField';

// Updated Hooks and Context
import { useUserService } from '../hooks/useUserService';
import { useAuth } from '../context/AuthContext';


// NOTE: import.meta is not available in all environments, using placeholder logic
const VITE_BACKEND_URL = ''; // Placeholder for environment variable
const apiBackendUrl = VITE_BACKEND_URL || '';

// The backend path for the default image. (Using the path from your code)
const DEFAULT_AVATAR_PATH = '/profile_picture/default-image.webp'; 
// The full URL for the default image, used for rendering.
const DEFAULT_AVATAR_URL = `${apiBackendUrl}${DEFAULT_AVATAR_PATH}`; 


function UserProfile() {
  // Destructure the NEW function: fetchProfilePicture
  const { user, loading: authLoading, login } = useAuth();
  const { 
      isLoading: isServiceLoading, 
      fetchProfile, 
      fetchProfilePicture, // <--- NEWLY DESTRUCTURED FUNCTION
      updateUserInfo, 
      updateProfilePicture 
  } = useUserService();
  const navigate = useNavigate();

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
  const [isPictureRemoved, setIsPictureRemoved] = useState(false); 
  const [password, setPassword] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);
  
  // Combine all loading states
  const isLoading = authLoading || isServiceLoading || isSaving;


  useEffect(() => {
    const fetchUserProfileData = async () => {
      if (authLoading || !user) {
        return;
      }
      try {
        // NOTE: We rely on the initial fetchProfile to still return the picture path,
        // which is often simpler than fetching the data via two separate calls.
        const response = await fetchProfile();
        const data = response.user; 

        // Determine the correct path/URL for the profile picture
        // Use DEFAULT_AVATAR_PATH if data.profile_picture is null/undefined
        // Assuming the backend sends the key 'profile_picture' for consistency
        const picturePath = data.profile_picture || DEFAULT_AVATAR_PATH; 
        const pictureUrl = picturePath.startsWith('http') || picturePath.startsWith('blob:') ? picturePath : `${apiBackendUrl}${picturePath}`;

        const sanitizedData = {
            ...profileData, 
            ...data,
            profile_picture: pictureUrl // Store the rendered URL
        };
        
        // Store the PATH/FILE NAME in original data for comparison
        const originalData = { ...sanitizedData, profile_picture: picturePath };

        setProfileData(sanitizedData);
        setOriginalProfileData(originalData);
        toast.success('Profile loaded successfully');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error(error.message || 'Failed to load profile. Please try again.');
      }
    };

    fetchUserProfileData();
    
    // Cleanup URL object if a file was selected but navigation occurred
    return () => {
        if (selectedFile && profileData.profile_picture.startsWith('blob:')) {
            URL.revokeObjectURL(profileData.profile_picture);
        }
    }
  }, [authLoading, user]);


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
      setIsPictureRemoved(false); // If a new file is uploaded, it's not removed

      // Create local URL for immediate image preview
      const previewUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        profile_picture: previewUrl,
      }));
    }
  };
  
  const handleRemovePicture = () => {
    // Revoke the local URL if it exists
    if (selectedFile && profileData.profile_picture.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profile_picture);
    }
    
    setSelectedFile(null); // Clear any pending file upload
    setIsPictureRemoved(true); // Flag for backend to delete picture
    setProfileData(prevData => ({
        ...prevData,
        profile_picture: DEFAULT_AVATAR_URL, // Show default avatar immediately
    }));

    toast.success('Profile picture marked for removal on save.', { id: 'pic-remove-toast' });
  };


  const handleSaveChanges = async () => {
    setIsSaving(true);
    toast.dismiss();

    if (!user) {
      toast.error('User not authenticated. Cannot save profile.');
      setIsSaving(false);
      return;
    }

    const userInfoChanges = {};
    let hasUserInfoChanges = false;
    
    // Fields that are updatable (excluding profile_picture and password)
    const updatableTextualFields = [
      'first_name', 'last_name', 'email', 'phone_number', 
      'address', 'date_of_birth', 'gender', 'specialization', 'username'
    ];
    
    // 1. Identify User Info Changes
    updatableTextualFields.forEach(key => {
      const originalValue = originalProfileData[key] || '';
      const currentValue = profileData[key] || '';
      
      if (currentValue.toString() !== originalValue.toString()) {
           userInfoChanges[key] = currentValue;
           hasUserInfoChanges = true;
      }
    });
    
    // 2. Handle Password Change
    if (password) {
        userInfoChanges.password = password;
        hasUserInfoChanges = true;
    }

    // 3. Identify Picture Changes
    let hasPictureChanges = !!selectedFile || isPictureRemoved;
    
    // Check if any actual data needs to be saved
    if (!hasUserInfoChanges && !hasPictureChanges) {
        toast('No changes detected. Nothing to save.', { icon: 'ℹ️' });
        setIsSaving(false);
        setIsEditing(false);
        return;
    }
    
    const updatePromises = [];
    let latestUserData = {}; // Object to collect merged data from both successful updates
    
    // --- 4. ASYNCHRONOUSLY Execute Updates ---
    
    // A. Update User Info (Textual/Password)
    if (hasUserInfoChanges) {
        updatePromises.push(
            updateUserInfo(userInfoChanges)
            .then(response => {
                // Merge info updates into the latest data object
                latestUserData = { ...latestUserData, ...response.user };
                return 'info_success';
            })
            .catch(err => {
                toast.error(`Info Update Failed: ${err.message}`, { id: 'info-fail' });
                throw err;
            })
        );
    }
    
    // B. Update Profile Picture
    if (hasPictureChanges) {
        const pictureFormData = new FormData();
        if (selectedFile) {
            pictureFormData.append('profilePic', selectedFile); 
        } else if (isPictureRemoved) {
             pictureFormData.append('remove_profile_picture', 'true');
        }
        
        updatePromises.push(
            updateProfilePicture(pictureFormData)
            .then(response => {
                // Merge picture updates (mainly profile_picture path) into the latest data object
                // We rely on the backend response to have the full user object with the new picture path
                latestUserData = { ...latestUserData, ...response.user }; 
                return 'pic_success';
            })
            .catch(err => {
                toast.error(`Picture Update Failed: ${err.message}`, { id: 'pic-fail' });
                throw err;
            })
        );
    }

    try {
        // Wait for all promises to resolve (they run in parallel)
        await Promise.all(updatePromises);
        
        // At this point, latestUserData holds the merged, updated data from the server.
        if (Object.keys(latestUserData).length > 0) {
            
            const newPicturePath = latestUserData.profile_picture || DEFAULT_AVATAR_PATH;
            // The new picture URL might be a local blob URL if only the file was updated, 
            // but the server response should contain the final path. We handle conversion here:
            const newPictureUrl = newPicturePath.startsWith('http') || newPicturePath.startsWith('blob:') ? newPicturePath : `${apiBackendUrl}${newPicturePath}`;
            
            // 1. Update Auth Context (with the final, merged server data)
            login(latestUserData);
            
            // 2. Update Local State (using the URL for display)
            setProfileData(prevData => ({ 
                ...prevData, 
                ...latestUserData,
                profile_picture: newPictureUrl, 
            }));
            
            // 3. Set new original data for future comparisons (using the PATH for comparison)
            setOriginalProfileData(prevData => ({ 
                ...prevData, 
                ...latestUserData,
                profile_picture: newPicturePath, 
            }));

            // 4. Cleanup and Reset
            if (profileData.profile_picture.startsWith('blob:')) {
                URL.revokeObjectURL(profileData.profile_picture);
            }
            setSelectedFile(null);
            setPassword('');
            setIsPictureRemoved(false);
            
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } else {
             // Should only happen if Promise.all succeeded but returned no data (highly unlikely with this logic)
             toast.success('Update completed successfully.');
             setIsEditing(false);
        }
    } catch (finalError) {
        // The individual catch blocks already handled and toasted specific errors.
        console.error('Final Save orchestrator error caught:', finalError);
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancelEdit = () => {
    // Revert to original data. We need to reconstruct the URL from the stored path.
    const originalPicturePath = originalProfileData.profile_picture || DEFAULT_AVATAR_PATH;
    const originalPictureUrl = originalPicturePath.startsWith('http') ? originalPicturePath : `${apiBackendUrl}${originalPicturePath}`;

    setProfileData(prevData => ({ ...originalProfileData, profile_picture: originalPictureUrl }));
    setSelectedFile(null);
    setPassword('');
    setIsPictureRemoved(false); // Reset removal flag
    setIsEditing(false);
    toast.dismiss();
    // Revoke any pending preview URL
    if (profileData.profile_picture.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profile_picture);
    }
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  const finalProfilePictureUrl = profileData.profile_picture;


  if (isLoading) {
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
                key={finalProfilePictureUrl} 
                src={finalProfilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }} // Fallback on error
              />

              {isEditing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-sm font-medium">
                    <label
                      htmlFor="profile-picture-upload"
                      className="p-2 cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center"
                      title="Change profile picture"
                    >
                      <Camera size={28} className="mb-1" />
                    </label>
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Remove Picture Button (only shown if a picture is currently set and not the default path, OR a file is selected for preview) */}
                    {((originalProfileData.profile_picture && originalProfileData.profile_picture !== DEFAULT_AVATAR_PATH) || selectedFile) && !isPictureRemoved && (
                        <button
                            type="button"
                            onClick={handleRemovePicture}
                            className="p-2 mt-1 text-red-400 hover:text-red-300 hover:bg-white/20 rounded-full transition-colors flex items-center"
                            title="Remove profile picture"
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                </div>
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