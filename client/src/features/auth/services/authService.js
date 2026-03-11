// src/features/auth/services/authService.js

import { BACKEND_URL, API_VERSION } from '../../../lib/constants';
import { apiFetch } from '../../../lib/api'

// Handles the login request
export const loginUser = async (username, password) => {
  const endpoint = `${API_VERSION}/auth/login`;

  const options = {
    method: 'POST',
    body: JSON.stringify({ login: username, password }),
  };

  return apiFetch(endpoint, null, options);
};