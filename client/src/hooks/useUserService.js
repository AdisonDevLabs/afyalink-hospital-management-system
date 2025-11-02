// client/src/hooks/useUserService.js

import { useCallback } from "react";
import * as userService from '../api/services/userService';
import { useApiCaller } from "./useApiCaller";

export const useUserService = () => {
  const { isLoading, error, execute } = useApiCaller();

  const fetchProfile = useCallback(() => execute(userService.getProfile), [execute]);

  const fetchProfilePicture = useCallback(() => execute(userService.getProfilePicture), [execute]);

  const updateUserInfo = useCallback((updatedData) => execute(userService.updateUserInfo, updatedData), [execute])

  const fetchAllUsers = useCallback((params) => execute(userService.getAllUsers, params), [execute])

  const updateProfilePicture = useCallback((profileData) => execute(userService.updateProfilePicture, profileData), [execute])

  return {
    isLoading,
    error,
    fetchProfile,
    updateUserInfo,
    fetchAllUsers,
    updateProfilePicture,
  };
};