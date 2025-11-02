// client/src/api/services/userService.js

import apiClient from '../apiClient';

export const getAllUsers = async (params = {}) => {
  return await apiClient.get('/api/users', { params });
}

export const getProfile = async () => {
  return await apiClient.get('/api/users/profile');
}

export const updateProfile = async (updatedData) => {
  return await apiClient.put('/api/users/profile', updatedData);
}