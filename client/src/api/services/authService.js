// client/src/api/authService.js

import apiClient from '../apiClient';

// Handles all authentication-related API calls.

export const login = async (credentials) => {
  // returns the response.data object directly due to the interceptor
  return await apiClient.post('/api/auth/login', credentials);
};

export const logout = async () => {
  // The server will clear the HttpOnly cookie here.
  return await apiClient.post('/auth/logout');
};

export const getProfile = async () => {
  // Uses the 'protect' middleware on the server via the auth_token cookie
  return await apiClient.get('/api/auth/profile');
};