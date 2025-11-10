// client/src/features/dashboards/services/dashboardService.js

import { generateSimulatedVitalsHistory, simulateEmergencyAlerts } from "../utils/dashboardUtils";
import * as api from '../../../api/endpoints/dashboard';


export const fetchNurseDashboardData = async (userId, token) => {
  if (!token || !userId) {
    console.log(user);
    throw new Error('Authentication token or user ID is missing.');
  }

  const [
    patientsData, medicationsDueData, vitalsNeedingUpdateData, bedOccupancyData,
    alertsData, scheduleData, totalPatientsUnderCareData,
    medicationsAdministeredTodayData, vitalsRecordedTodayData, newDoctorOrdersData,
  ] = await Promise.all([
    api.getAssignedPatients(userId, token),
    api.getMedicationsDue(userId, token),
    api.getVitalsNeedingUpdate(userId, token),
    api.getBedOccupancy(token),
    api.getEmergencyAlerts(token),
    api.getShiftSchedule(userId, token),
    api.getTotalPatientsUnderCare(userId, token),
    api.getMedicationsAdministeredToday(userId, token),
    api.getVitalsRecordedToday(userId, token),
    api.getNewDoctorOrders(userId, token),
  ]);

  const simulatedVitalsHistory = {};
  (patientsData.patients || []).forEach(patient => {
    simulatedVitalsHistory[patient.id] = generateSimulatedVitalsHistory(); 
  });

  return {
    patientsAssignedToday: patientsData.patients || [],
    medicationsDueNow: medicationsDueData.medications || [],
    vitalsNeedingUpdate: vitalsNeedingUpdateData.vitals || [],
    bedOccupancy: bedOccupancyData || { available: 0, occupied: 0, total: 0, breakdown: {} },
    emergencyAlerts: alertsData.alerts || [],
    shiftSchedule: scheduleData.shifts || [],
    totalPatientsUnderCare: totalPatientsUnderCareData.count || 0,
    medicationsAdministeredToday: medicationsAdministeredTodayData.count || 0,
    vitalsRecordedToday: vitalsRecordedTodayData.count || 0,
    newDoctorOrders: newDoctorOrdersData.orders || [],
    simulatedVitalsHistory,
    simulatedEmergencyAlerts: simulateEmergencyAlerts(),
  };
};