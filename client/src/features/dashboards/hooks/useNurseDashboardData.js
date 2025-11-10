// client/src/features/dashboards/hooks/useNurseDashboardData.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { fetchNurseDashboardData } from '../services/dashboardService';

const initialDashboardState = {
  patientsAssignedToday: [], medicationsDueNow: [], vitalsNeedingUpdate: [],
  bedOccupancy: { available: 0, occupied: 0, total: 0, breakdown: {} },
  emergencyAlerts: [], shiftSchedule: [], totalPatientsUnderCare: 0,
  medicationsAdministeredToday: 0, vitalsRecordedToday: 0, newDoctorOrders: [],
  simulatedVitalsHistory: {}, simulatedEmergencyAlerts: [],
};

export const useNurseDashboardData = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(initialDashboardState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });

  const fetchData = useCallback(async () => {
    if (!token || !user?.id || user?.role !== 'nurse') {
      console.log(user)
      setLoading(false);
      console.log(user);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNurseDashboardData(user.id, token);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching nurse dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
      setNotification({ message: 'Failed to load dashboard data. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.role]);

  useEffect(() => {
    fetchData();
    
    // Sets up refresh interval
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000); 
    return () => clearInterval(refreshInterval);
  }, [fetchData]);


  // Logic for acknowledging an alert (can be extended with an API call later)
  const handleAcknowledgeAlert = useCallback((alertId) => {
    setDashboardData(prevData => ({
      ...prevData,
      simulatedEmergencyAlerts: prevData.simulatedEmergencyAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
    setNotification({ message: 'Emergency alert acknowledged.', type: 'success' });
  }, []);

  const closeNotification = () => setNotification({ message: null, type: null });

  return {
    dashboardData, loading, error, notification, handleAcknowledgeAlert, closeNotification, fetchData
  };
};