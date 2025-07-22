const pool = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const totalPatientsResult = await pool.query('SELECT COUNT(*) FROM patients');
    const totalPatients = parseInt(totalPatientsResult.rows[0].count, 10);
    const totalDoctorsResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'doctor'");
    const totalDoctors = parseInt(totalDoctorsResult.rows[0].count, 10);
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointmentsResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE appointment_date = $1 AND status = $2',
      [today, 'Scheduled']
    );
    const todaysAppointments = parseInt(todaysAppointmentsResult.rows[0].count, 10);
    const revenueSummary = 15000;
    res.status(200).json({
      totalPatients,
      totalDoctors,
      todaysAppointments,
      revenueSummary,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.stack);
    res.status(500).json({ message: 'Server error when fetching admin statistics.' });
  }
};

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