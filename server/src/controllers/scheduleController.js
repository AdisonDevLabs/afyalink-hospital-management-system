import pool from '../config/db.js';

const getStaffIdByUserId = async (userId) => {
    const result = await pool.query('SELECT id FROM staffs WHERE user_id = $1', [userId]);
    return result.rows.length > 0 ? result.rows[0].id : null; 
};
export async function getAllSchedules(req, res) {
  try {
    const result = await pool.query(`
      SELECT
          a.id,
          a.patient_id,
          a.reason AS original_reason,
          a.appointment_date,
          a.appointment_time,
          a.end_time,
          a.doctor_id,
          a.status,
          a.department_id,
          p.first_name AS patient_first_name,
          p.last_name AS patient_last_name,
          s.first_name AS doctor_first_name,
          s.last_name AS doctor_last_name,
          u.username AS doctor_username,
          d.name AS department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staffs s ON a.doctor_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    res.status(200).json(result.rows);
  } 
  catch (error) {
    console.error('Error fetching schedules:', error.stack);
    res.status(500).json({ message: 'Server error when fetching schedules.' });
  }
}

export async function createAppointment(req, res) {
    const { patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !end_time || !reason || !department_id) {
        return res.status(400).json({ message: 'Missing required appointment fields.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status || 'Scheduled', department_id]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error creating appointment:', error.stack);
        if (error.message && error.message.includes('violates not-null constraint')) {
            return res.status(400).json({ message: 'Failed to create appointment: Required fields cannot be empty.' });
        }
        res.status(500).json({ message: 'Server error creating appointment.' });
    }
}

export async function getAppointmentById(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        res.status(200).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error fetching appointment:', error.stack);
        res.status(500).json({ message: 'Server error fetching appointment.' });
    }
}

export async function updateAppointment(req, res) {
    const { id } = req.params;
    const { patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id } = req.body;

    // Basic validation...
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !end_time || !reason || !status || !department_id) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const result = await pool.query(
            `UPDATE appointments
             SET patient_id = $1, doctor_id = $2, appointment_date = $3, appointment_time = $4, end_time = $5, reason = $6, status = $7, department_id = $8, updated_at = NOW()
             WHERE id = $9 RETURNING *`,
            [patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating appointment:', error.stack);
        res.status(500).json({ message: 'Server error updating appointment.' });
    }
}

export async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully.', id: result.rows[0].id });
    } 
    catch (error) {
        console.error('Error deleting appointment:', error.stack);
        res.status(500).json({ message: 'Server error deleting appointment.' });
    }
}

// =========================================================
// DOCTOR AVAILABILITY (Refactored for "Role in Users Table")
// =========================================================

export async function createDoctorAvailability(req, res) {
    // doctor_id in body is the STAFF ID
    const { doctor_id, day_of_week, start_time, end_time } = req.body; 
    const requesterRole = req.user.role; // 'admin', 'doctor', etc.
    const requesterUserId = req.user.id; // The ID from users table

    try {
        // PERMISSION CHECK:
        // If the requester is a doctor, they can only create availability for themselves.
        if (requesterRole === 'doctor') {
            const myStaffId = await getStaffIdByUserId(requesterUserId);
            
            if (!myStaffId) {
                return res.status(403).json({ message: 'Doctor profile not found.' });
            }
            
            if (parseInt(doctor_id) !== myStaffId) {
                return res.status(403).json({ message: 'Doctors can only create availability for themselves.' });
            }
        }
        // Note: If requesterRole is 'admin', we skip the check above and allow them to proceed.

        if (!doctor_id || day_of_week === undefined || start_time === undefined || end_time === undefined) {
            return res.status(400).json({ message: 'Missing required availability fields.' });
        }

        const result = await pool.query(
            `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [doctor_id, day_of_week, start_time, end_time]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error creating doctor availability:', error.stack);
        res.status(500).json({ message: 'Server error creating doctor availability.' });
    }
}

export async function getDoctorAvailabilities(req, res) {
    const { doctor_id } = req.query; 
    const requesterRole = req.user.role;
    const requesterUserId = req.user.id;

    try {
        let query = `
            SELECT
                da.id,
                da.doctor_id,
                s.first_name AS doctor_first_name,
                s.last_name AS doctor_last_name,
                u.username, 
                da.day_of_week,
                da.start_time,
                da.end_time,
                COALESCE(da.max_patients_per_slot, 1) AS max_patients_per_slot,
                COALESCE(da.is_active, TRUE) AS is_active
            FROM doctor_availability da
            JOIN staffs s ON da.doctor_id = s.id
            JOIN users u ON s.user_id = u.id
        `;
        const queryParams = [];

        // 1. If user is a DOCTOR, they ONLY see their own slots.
        if (requesterRole === 'doctor') {
            const myStaffId = await getStaffIdByUserId(requesterUserId);
            
            // FIXED: If doctor has no profile yet, return empty list instead of Error
            if (!myStaffId) {
                return res.status(200).json([]); 
            }

            query += ` WHERE da.doctor_id = $1`;
            queryParams.push(myStaffId);
        } 
        // 2. If user is ADMIN/RECEPTIONIST, they can filter by query param
        else if (doctor_id) {
            query += ` WHERE da.doctor_id = $1`;
            queryParams.push(doctor_id);
        }

        query += ` ORDER BY da.day_of_week, da.start_time`;
        
        const result = await pool.query(query, queryParams);
        res.status(200).json(result.rows);
    } 
    catch (error) {
        console.error('Error fetching doctor availabilities:', error.stack);
        res.status(500).json({ message: 'Server error fetching doctor availabilities.' });
    }
}

export async function updateDoctorAvailability(req, res) {
    const { id } = req.params;
    const { doctor_id, day_of_week, start_time, end_time, max_patients_per_slot, is_active } = req.body;
    const requesterRole = req.user.role;
    const requesterUserId = req.user.id;

    try {
        const availabilityCheck = await pool.query('SELECT doctor_id FROM doctor_availability WHERE id = $1', [id]);

        if (availabilityCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }

        // Permission Check
        if (requesterRole === 'doctor') {
            const myStaffId = await getStaffIdByUserId(requesterUserId);
            // Ensure doctor owns this slot
            if (availabilityCheck.rows[0].doctor_id !== myStaffId) {
                return res.status(403).json({ message: 'Doctors can only update their own availability.' });
            }
        }

        const result = await pool.query(
            `UPDATE doctor_availability
             SET doctor_id = $1, day_of_week = $2, start_time = $3, end_time = $4, max_patients_per_slot = $5, is_active = $6
             WHERE id = $7 RETURNING *`,
            [doctor_id, day_of_week, start_time, end_time, max_patients_per_slot, is_active, id]
        );

        res.status(200).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error updating doctor availability:', error.stack);
        res.status(500).json({ message: 'Server error when updating doctor availability.' });
    }
}

export async function deleteDoctorAvailability(req, res) {
    const { id } = req.params;
    const requesterRole = req.user.role;
    const requesterUserId = req.user.id;

    try {
        const availabilityCheck = await pool.query('SELECT doctor_id FROM doctor_availability WHERE id = $1', [id]);

        if (availabilityCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }

        // Permission Check
        if (requesterRole === 'doctor') {
             const myStaffId = await getStaffIdByUserId(requesterUserId);
            if (availabilityCheck.rows[0].doctor_id !== myStaffId) {
                return res.status(403).json({ message: 'Doctors can only delete their own availability.' });
            }
        }

        const deleteResponse = await pool.query('DELETE FROM doctor_availability WHERE id = $1 RETURNING id', [id]);
        res.status(200).json({ message: 'Doctor availability deleted successfully.', id: deleteResponse.rows[0].id });
    } 
    catch (error) {
        console.error('Error deleting doctor availability:', error.stack);
        res.status(500).json({ message: 'Server error deleting doctor availability.' });
    }
}