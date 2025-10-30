import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";

export const patientsApi = () => {
  const { token, getApiPrefix } = useAuth();

  const getApiParams = (method, endpoint, body) => ({
    method,
    endpoint,
    ...(body && { body }),
    token,
    apiPrefix: getApiPrefix(),
  });

  const fetchPatients = async () => {
    return apiClient(getApiParams('GET', 'patients'));
  };

  const createPatient = async (patientData) => {
    return apiClient(getApiParams('POST', 'patients', patientData));
  };

  const updatePatient = async (patientId, patientData) => {
    return apiClient(getApiParams('PUT', `patients/${patientId}`, patientData));
  };

  const deletePatient = async (patientId) => {
    return apiClient(getApiParams('DELETE', `patients/${patientId}`));
  };

  const fetchPatientById = async (patientId) => {
    return apiClient(getApiParams('GET', `patients/${patientId}`));
  };


  return {
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    fetchPatientById,
  };
};