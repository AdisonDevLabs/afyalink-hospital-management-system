// backend/src/controllers/adminController.js

const pool = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    // Total Patients
    const totalPatientsResult = await pool.query('SELECT COUNT(*) FROM patients');
    const totalPatients = parseInt(totalPatientsResult.rows[0].count, 10);

    // Total Doctors
    const totalDoctorsResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'doctor'");
    const totalDoctors = parseInt(totalDoctorsResult.rows[0].count, 10);

    // Today's Appointments
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const todaysAppointmentsResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE appointment_date = $1 AND status = $2',
      [today, 'Scheduled'] // Only count scheduled appointments for today
    );
    const todaysAppointments = parseInt(todaysAppointmentsResult.rows[0].count, 10);

    // Revenue Summary (Placeholder - you'll need a billing/payments table for real data)
    // For now, we'll return a dummy value or sum from a hypothetical table
    // Example: SELECT SUM(amount) FROM payments WHERE payment_date = $1
    const revenueSummary = 15000; // Dummy value for demonstration

    // You can add more complex queries for trend graphs later if needed,
    // for example, monthly appointments, patient registrations over time, etc.

    res.status(200).json({
      totalPatients,
      totalDoctors,
      todaysAppointments,
      revenueSummary, // This will be a placeholder for now
      // You can add more stats here
    });

  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.stack);
    res.status(500).json({ message: 'Server error when fetching admin statistics.' });
  }
};

// New function to get appointment status counts for the pie chart
exports.getAppointmentStatusCounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching appointment status counts:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointment status counts.' });
  }
};