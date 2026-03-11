// src/models/adminModel.js

import pool from '../config/db.js';

export const getPatientCount = async () => {
  const res = await pool.query('SELECT COUNT(*) FROM patients');
  return parseInt(res.rows[0].count, 10);
};

export const getDoctorCount = async () => {
  const res = await pool.query("SELECT COUNT(*) FROM staffs WHERE role = 'doctor'");
  return parseInt(res.rows[0].count, 10);
};

export const getAppointmentCountByDate = async (date) => {
  const query = 'SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = $1 AND status = $2';
  const res = await pool.query(query, [date, 'Scheduled']);
  return parseInt(res.rows[0].count, 10);
};

export const getRevenueByDate = async (date) => {
  const query = 'SELECT SUM(amount) FROM payments WHERE DATE(payment_date) = $1';
  const res = await pool.query(query, [date]);
  return parseFloat(res.rows[0].sum) || 0; // Return 0 if no revenue
};

export const getAppointmentStatusCounts = async () => {
  const query = `
    SELECT status, COUNT(*) as count
    FROM appointments
    GROUP BY status
  `;
  const res = await pool.query(query);
  return res.rows;
};