// client/src/api/services/userService.js

import apiClient from '../apiClient';

export const getAllUsers = async (params = {}) => {
  return await apiClient.get('/api/users', { params });
}

export const getProfile = async () => {
  return await apiClient.get('/api/users/profile');
}

export const getProfilePicture = async () => {
  return await apiClient.get('/api/users/profile/picture');
}

export const updateUserInfo = async (updatedData) => {
  return await apiClient.put('/api/users/profile/info', updatedData);
}

export const updateProfilePicture = async (profileData) => {
  // Override headers to ensure Content-Type is set to 'multipart/form-data' by browser/Axios
  const config = {
    headers: {
      'Content-Type': undefined
    },
  };
  return await apiClient.put('/api/users/profile/picture', profileData, config);
}