// src/features/auth/services/authService.js

import { BACKEND_URL, API_VERSION } from '../../../lib/constants';

// Handles the login request
export const loginUser = async (username, password) => {
  const url = `${BACKEND_URL}${API_VERSION}/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Login failed. Please check your credentials.');
  }

  return response.json();
};