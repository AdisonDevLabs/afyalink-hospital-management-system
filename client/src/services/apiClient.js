// client/src/services/apiClient.js

export const apiClient = async ({ method, endpoint, body, token, apiPrefix }) => {
  const fullUrl = `${apiPrefix}/${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const options = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = response.statusText;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback if the response body isn't JSON
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};