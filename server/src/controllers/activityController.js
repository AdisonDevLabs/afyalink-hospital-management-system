// src/controllers/activityController.js
const pool = require('../config/db'); // Assuming you have a db connection pool

exports.getDoctorActivities = async (req, res) => {
    try {
        const { doctor_id, limit = 5 } = req.query; // Get doctor_id and limit from query params

        if (!doctor_id) {
            return res.status(400).json({ message: 'doctor_id is required' });
        }

        // --- IMPORTANT: You need to implement the actual database query here ---
        // This is a placeholder. You need to design your 'activities' table
        // or fetch data by joining relevant tables (e.g., appointments, clinical_notes)
        // based on what 'activities' means in your application.

        // Example: Fetching recent appointments as "activities"
        const query = `
            SELECT
                a.id,
                a.appointment_date AS timestamp,
                'Appointment' AS type,
                p.first_name || ' ' || p.last_name AS patient_name,
                a.reason AS description
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.doctor_id = $1
            ORDER BY a.appointment_date DESC
            LIMIT $2;
        `;
        const { rows } = await pool.query(query, [doctor_id, limit]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching doctor activities:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};