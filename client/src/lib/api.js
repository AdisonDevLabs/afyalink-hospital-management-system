// client/src/api/api.js

import { BACKEND_URL } from "./constants";

export const apiFetch = async (endpoint, token, options = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Request failed (${response.status} ${response.statusText}): ${errorText}`);
    }

    if (response.status === 204) {
      return {};
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error performing API request to ${url}:`, error.message);
    throw error;
  }
};