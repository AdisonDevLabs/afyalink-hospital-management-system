// client/src/hooks/useUserService.js

import { useCallback } from "react";
import * as userService from '../api/services/userService';
import { useApiCaller } from "./useApiCaller";

export const useUserService = () => {
  const { isLoading, error, execute } = useApiCaller();

  const fetchProfile = useCallback(() => execute(userService.getProfile), [execute]);

  const editProfile = useCallback((updatedData) => execute(userService.updateProfile, updatedData), [execute])

  const fetchAllUsers = useCallback((params) => useApiCaller(userService.getAllUsers, params), [execute])

  return {
    isLoading,
    error,
    fetchProfile,
    editProfile,
    fetchAllUsers,
  };
};