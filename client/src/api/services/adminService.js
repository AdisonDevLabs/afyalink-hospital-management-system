import apiClient from "../apiClient";

export const getAdminStats = async () => {
  return await apiClient.get('/api/admin/stats');
};

export const getAppointmentStatusCounts = async () => {
  return await apiClient.get('/api/admin/appointments/status-counts');
};


export const getAllUsers = async (params = {}) => {
  return await apiClient.get('/api/admin/users', { params });
};

export const registerUser = async (userData) => {
  return await apiClient.post('/api/admin/users', userData);
};

export const updateUser = async (getUserById, updateData) => {
  return await apiClient.put(`/api/admin/users/${userId}`, updateData);
};

export const deleteUser = async (userId) => {
  return await apiClient.delete(`/api/admin/users/${userId}`);
};

export const toggleUserStatus = async (userId, isActive) => {
  return await apiClient.put(`/api/admin/users/${userId}/toggle-status`, { is_active: isActive });
};

export const resetUserPassword = async (userId) => {
  return await apiClient.post(`/api/admin/users/${userId}/reset-password`);
};

export const getUserById = async (userId) => {
  return await apiClient.get(`/api/admin/users/${userId}`);
};