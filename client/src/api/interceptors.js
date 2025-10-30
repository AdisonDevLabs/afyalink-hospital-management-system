// client/src/api/interceptors.js

import apiClient from './apiClient';

// Sets up global request and response interceptors for Axios
// Crucial for centralized error handling and security policies

export const setupInterceptors = (store) => {
  apiClient.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      const { response } = error;

      if (response) {
        const status = response.status;
        const message = response.data?.message || 'An unknown error occurred.';

        // --- GLOBAL ERROR HANDLING ---
        // 401 Unautorized (Token Missing/Invalid/Cookie Cleared)
        if (status === 401 || status === 403) {
          console.error(`Auth Error ${status}:`, message);
        }

        // 403 Forbidden (Demo Mode Restriction, RBAC Denied)
        if (status === 403) {
          if (message.includes('Write operations (POST, PUT, DELETE) are disabled in Demo Mode.')) {
            return Promise.reject({
              isDemoRestriction: true,
              message: message,
              status: 403
            });
          }
        }
        return Promise.reject({
          status: status,
          message: message,
          originalError: response.data,
        });
      }

      // Handle network error (no response from server)
      return Promise.reject({
        status: 'NETWORK_ERROR',
        message: 'Server unreachable or request timed out.',
        originalError: error,
      });
    }
  );
};