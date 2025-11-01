import { useState, useCallback } from "react";
import * as adminService from '../api/adminService';

export const useAdminService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, ...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiCall(...args);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occured during the request.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(() => execute(adminService.getAdminStats), [execute]);

  const fetchAppointmentStats = useCallback(() => execute(adminService.getAppointmentStatusCounts), [execute]);

  const fetchAllUsers = useCallback((params) => execute(adminService.getAllUsers, params), [execute]);

  const createNewUser = useCallback((userData) => execute(adminService.registerUser, userData), [execute]);

  const editUser = useCallback((userId, updateData) => execute(adminService.updateUser, userId, updateData), [execute]);

  const removeUser = useCallback((userId) => execute(adminService.deleteUser, userId), [execute]);

  const toggleStatus = useCallback((userId, isActive) => execute(adminService.toggleUserStatus, userId, isActive), [execute]);

  const passwordReset = useCallback((userId) => execute(adminService.resetUserPassword, userId), [execute]);


  return {
    isLoading,
    error,
    fetchStats,
    fetchAppointmentStats,
    fetchAllUsers,
    createNewUser,
    editUser,
    removeUser,
    toggleStatus,
    passwordReset,
  };
};