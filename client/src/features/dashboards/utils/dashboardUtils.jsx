// client/src/features/dashboards/utils/dashboardUtils.js

import React from "react";

export const generateSimulatedVitalsHistory = () => {
  const history = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 3600 * 1000 * 4);
    history.unshift({
      timestamp: date.toISOString(),
      bp: `${Math.floor(Math.random() * (140 - 90) + 90)}/${Math.floor(Math.random() * (90 - 60) + 60)}`,
      hr: Math.floor(Math.random() * (100 - 60) + 60),
      temp: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1),
      spo2: Math.floor(Math.random() * (100 - 95) + 95),
    });
  }
  return history;
};

export const simulateEmergencyAlerts = () => {
  return [
    { id: 1, type: 'Code Blue', patient_name: 'Jane Doe', room_number: 'ICU 3', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), acknowledged: false },
    { id: 2, type: 'Fall Alert', patient_name: 'John Smith', room_number: 'Ward 201', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), acknowledged: false },
  ];
};

export const getPatientAvatar = (patient) => {
  if (patient.photo_url) return <img src={patient.photo_url} alt={patient.first_name} className="h-8 w-8 rounded-full object-cover mr-2" />;
  const initials = `${patient.first_name ? patient.first_name[0] : ''}${patient.last_name ? patient.last_name[0] : ''}`.toUpperCase();
  const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  const colors = ['blue', 'green', 'indigo', 'purple', 'pink', 'yellow', 'teal', 'cyan'];
  const baseColor = colors[hash % colors.length];

  return (
   <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm bg-${baseColor}-200 text-${baseColor}-800 dark:bg-${baseColor}-700 dark:text-${baseColor}-100 mr-2 flex-shrink-0`}>
    {initials || '?'}
   </div> 
  );
};

export const getVitalStatusColor = (vital) => {
  const bpSystolic = parseInt(vital.bp?.split('/')[0]);
  const hr = parseInt(vital.hr);
  const temp = parseFloat(vital.temp);
  const spo2 = parseInt(vital.spo2);
  if (bpSystolic > 160 || bpSystolic < 90 || hr > 120 || hr < 50 || temp > 38.5 || spo2 < 90) return 'text-red-600 dark:text-red-400';
  if (bpSystolic > 140 || bpSystolic < 100 || hr > 100 || hr < 60 || temp > 37.8 || spo2 < 94) return 'text-orange-600 dark:text-orange-400';
  return 'text-green-600 dark:text-green-400';
};