// client/src/hooks/useApiCaller.js

import { useState, useCallback } from "react";

export const useApiCaller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, ...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiCall(...args);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected server error occurred.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    execute,
  };
};