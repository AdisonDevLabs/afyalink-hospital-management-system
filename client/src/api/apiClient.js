// client/src/api/apiClient.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,

  // ESSENTIAL for sending HttpOnly 'auth_token' cookie with every request
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;