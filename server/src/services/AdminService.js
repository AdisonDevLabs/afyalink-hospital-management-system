// src/services/adminService.js

import {
  getPatientCount,
  getDoctorCount,
  getAppointmentCountByDate,
  getRevenueByDate,
  getAppointmentStatusCounts as getStatusCountsFromModel
} from '../models/AdminModel.js';

export const getDashboardStatsService = async () => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const [
      totalPatients,
      totalDoctors,
      todaysAppointments,
      revenueSummary
    ] = await Promise.all([
      getPatientCount(),
      getDoctorCount(),
      getAppointmentCountByDate(today),
      getRevenueByDate(today)
    ]);

    return {
      totalPatients,
      totalDoctors,
      todaysAppointments,
      revenueSummary
    };

  } catch (error) {
    console.error('Error in dashboard stats service:', error);
    throw new Error('Failed to retrieve dashboard statistics.');
  }
};


export const getAppointmentStatusCountsService = async () => {
  try {
    return await getStatusCountsFromModel();
  } catch (error) {
    console.error('Error in appointment status service:', error);
    throw new Error('Failed to retrieve appointment status counts.');
  }
};