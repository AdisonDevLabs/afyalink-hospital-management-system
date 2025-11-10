import { apiFetch } from "../../lib/api";

// Utility function to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0];


// Retrieves patients currently assigned to the nurse for today.
export const getAssignedPatients = (userId, token) => {
  const today = getTodayDate();
  return apiFetch(`/api/v1/patients?nurse_id=${userId}&assigned_today=${today}`, token);
};

// Retrieves medications due for administration by the nurse.
export const getMedicationsDue = (userId, token) => {
  return apiFetch(`/api/v1/medications/due?nurse_id=${userId}`, token);
};

// Retrieves patient vitals that are outside scheduled recording frequency.
export const getVitalsNeedingUpdate = (userId, token) => {
  return apiFetch(`/api/v1/vitals/needs-update?nurse_id=${userId}`, token);
};

// Retrieves current bed occupancy statistics.
export const getBedOccupancy = (token) => {
  return apiFetch(`/api/v1/beds/availability`, token);
};

// Retrieves emergency and high-priority alerts for nurses.
export const getEmergencyAlerts = (token) => {
  return apiFetch(`/api/v1/alerts?recipient_role=nurse`, token);
};

// Retrieves the nurse's shift schedule for the current day.
export const getShiftSchedule = (userId, token) => {
  const today = getTodayDate();
  return apiFetch(`/api/v1/schedules?user_id=${userId}&date=${today}`, token);
};

// Retrieves the total patients under nurse's care
export const getTotalPatientsUnderCare = (userId, token) => {
    return apiFetch(`/api/v1/patients/count?nurse_id=${userId}`, token);
};

// Retrieves all medications administered for the current day
export const getMedicationsAdministeredToday = (userId, token) => {
    const today = getTodayDate();
    return apiFetch(`/api/v1/medications/administered/count?nurse_id=${userId}&date=${today}`, token);
};

// Retrieves all the vitals recorded in the current day
export const getVitalsRecordedToday = (userId, token) => {
    const today = getTodayDate();
    return apiFetch(`/api/v1/vitals/recorded/count?nurse_id=${userId}&date=${today}`, token);
};

// Retrieves doctor's orders for nurse
export const getNewDoctorOrders = (userId, token) => {
    return apiFetch(`/api/v1/orders/new?nurse_id=${userId}`, token);
};