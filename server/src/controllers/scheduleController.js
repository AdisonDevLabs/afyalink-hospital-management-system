// server/src/controllers/scheduleController.js

const pool = require('../config/db');

exports.getAllSchedules = async (req, res) => {
  const { role: user_role, id: user_id } = req.user;
  const { doctor_id: filter_doctor_id, patient_id: filter_patient_id } = req.query;

  let query = `
    SELECT
      a.id, a.patient_id, a.reason AS original_reason, a.appointment_date, a.appointment_time, a.end_time, a.doctor_id, a.status, a.department_id,
      p.first_name AS patient_first_name, p.last_name AS patient_last_name,
      u.first_name AS doctor_first_name, u.last_name AS doctor_last_name, u.username AS doctor_username,
      d.name AS department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON a.doctor_id = u.id
    LEFT JOIN departments d ON a.department_id = d.id
  `;
  const queryParams = [];
  let whereClauses = [];
  let paramIndex = 1;

  //Nurses and Doctors see only their own appointments
  if (user_role === 'doctor') {
    whereClauses.push(`a.doctor_id = $${paramIndex++}`);
    queryParams.push(user_id);
  }

  // Filtering for Admins/Receptionist 
  if (user_role !== 'doctor' && user_role !== 'nurse') {
    if (filter_doctor_id) {
        whereClauses.push(`a.doctor_id = $${paramIndex++}`)
        queryParams.push(filter_doctor_id);
    }
    if (filter_patient_id) {
        whereClauses.push(`a.patient_id = $${paramIndex++}`);
        queryParams.push(filter_patient_id);
    }
  }

  if (whereClauses.length > 0) {
    query += `WHERE ${whereClauses.join(' AND ')}`;
  }

  query += `ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

  try {
    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } 
  catch (error) {
    console.error('Error fetching schedules:', error.stack);
    res.status(500).json({ message: 'Server error when fetching schedules.' });
  }
};

exports.createAppointment = async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !end_time || !reason || !status || !department_id) {
    return res.status(400).json({ message: 'Missing required appointment fields.' });
  }

  try {
    const result = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id,  appointment_date, appointment_time, end_time, reason, status, department_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status || 'Scheduled', department_id]
    );
    res.status(201).json(result.rows[0]);
  } 
  catch (error) {
  console.error('Error creating appointment:', error.stack);

  if (error.message && error.message.includes('violates not-null constraint')) {
    return res.status(400).json({ message: 'Failed to create appointment: Patient ID, Doctor ID, Date, Times, or Reason cannot be empty.' });
  }
  res.status(500).json({ message: 'Server error creating appointment.' });
  }
};

exports.getAppointmentById = async (req, res) => {
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
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_date, appointment_time, end_time, reason, status, department_id } = req.body;
  const { role: user_role, id: user_id } = req.user;

  // Check if appointment exists and get the assigned doctor
  const existingAppointment = await pool.query('SELECT doctor_id FROM appointments WHERE id = $1', [id]);
  if (existingAppointment.rows.length === 0) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  const assigned_doctor_id = existingAppointment.rows[0].doctor_id;

  // Only Admin or assigned Doctor can proceed.
  if (user_role !== 'admin' && user_id !== assigned_doctor_id) {
    return res.status(403).json({ message: 'Access Denied. Only the assigned doctor or an admin can update this appointment.' });
  }
  // Prevent a doctor from changing the appointment to another doctor's ID, unless they are admin.
  if (user_role === 'doctor' && doctor_id && doctor_id !== user_id) {
    return res.status(403).json({ message: 'Doctors cannot reassign appointments to other doctors.' });
  }

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !end_time || !reason || !status || !department_id) {
    return res.status(400).json({ message: 'Missing required appointment fields for update.' });
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

    if (error.message && error.message.includes('violates not-null constraint')) {
      return res.status(400).json({ message: 'Failed to update appointment: Patient ID, Doctor ID, Date, Times, or Reason cannot be empty.' });
    }
    res.status(500).json({ message: 'Server error updating appointment.' });
  }
};

exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    const { role: user_role, id: user_id } = req.user;

    try {
        // Check if the appointment exists and get assigned doctor_id.
        const existingAppointment = await pool.query('SELECT doctor_id FROM appointments WHERE id = $1', [id]);
        if (existingAppointment.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        const assigned_doctor_id = existingAppointment.rows[0].doctor_id;

        // Only Admin or assigned Doctor can proceed.
        if (user_role !== 'admin' && user_id !== assigned_doctor_id) {
            return res.status(403).json({ message: 'Access Denied. Only the assigned doctor or an admin can delete the appointment.' });
        }

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
};

exports.createDoctorAvailability = async (req, res) => {
    const { doctor_id, day_of_week, start_time, end_time } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole === 'doctor' && doctor_id !== requesterId) {
        return res.status(403).json({ message: 'Doctors can only create availability for themselves.' });
    }

    if (!doctor_id || day_of_week === undefined || start_time === undefined || end_time === undefined) {
        return res.status(400).json({ message: 'Missing required availability fields.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [doctor_id, day_of_week, start_time, end_time]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error creating doctor availability:', error.stack);
         if (error.message && error.message.includes('violates not-null constraint')) {
            return res.status(400).json({ message: 'Failed to create availability: Doctor ID, Day of Week, Start Time, or End Time cannot be empty.' });
        }
        res.status(500).json({ message: 'Server error creating doctor availability.' });
    }
};

exports.getDoctorAvailabilities = async (req, res) => {
    const { doctor_id } = req.query;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    try {
        let query = `
            SELECT
                da.id,
                da.doctor_id,
                u.first_name AS doctor_first_name,
                u.last_name AS doctor_last_name,
                u.username, -- Include username for display
                da.day_of_week,
                da.start_time,
                da.end_time,
                COALESCE(da.max_patients_per_slot, 1) AS max_patients_per_slot,
                COALESCE(da.is_active, TRUE) AS is_active
            FROM doctor_availability da
            JOIN users u ON da.doctor_id = u.id
        `;
        const queryParams = [];

        if (requesterRole === 'doctor') {
            query += ` WHERE da.doctor_id = $1`;
            queryParams.push(requesterId);
        } 
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
};

exports.updateDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const { doctor_id, day_of_week, start_time, end_time, max_patients_per_slot, is_active } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (!doctor_id || day_of_week === undefined || start_time === undefined || end_time === undefined || max_patients_per_slot === undefined || is_active === undefined) {
        return res.status(400).json({ message: 'Missing required availability fields for update.' });
    }

    try {
        const availabilityCheck = await pool.query('SELECT doctor_id FROM doctor_availability WHERE id = $1', [id]);

        if (availabilityCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }

        if (requesterRole === 'doctor' && availabilityCheck.rows[0].doctor_id !== requesterId) {
            return res.status(403).json({ message: 'Doctors can only update their own availability.' });
        }

        const result = await pool.query(
            `UPDATE doctor_availability
             SET doctor_id = $1, day_of_week = $2, start_time = $3, end_time = $4, max_patients_per_slot = $5, is_active = $6
             WHERE id = $7 RETURNING *`,
            [doctor_id, day_of_week, start_time, end_time, max_patients_per_slot, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }
        res.status(200).json(result.rows[0]);
    } 
    catch (error) {
        console.error('Error updating doctor availability:', error.stack);

        if (error.message && error.message.includes('violates not-null constraint')) {
            return res.status(400).json({ message: 'Failed to update availability: Doctor ID, Day of Week, Start Time, End Time, Max Patients, or Active status cannot be empty.' });
        }
        res.status(500).json({ message: 'Server error when updating doctor availability.' });
    }
};

exports.deleteDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    try {
        const availabilityCheck = await pool.query('SELECT doctor_id FROM doctor_availability WHERE id = $1', [id]);

        if (availabilityCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }

        if (requesterRole === 'doctor' && availabilityCheck.rows[0].doctor_id !== requesterId) {
            return res.status(403).json({ message: 'Doctors can only delete their own availability.' });
        }

        const deleteResponse = await pool.query('DELETE FROM doctor_availability WHERE id = $1 RETURNING id', [id]);

        if (deleteResponse.rows.length === 0) {
            return res.status(404).json({ message: 'Availability not found.' });
        }
        res.status(200).json({ message: 'Doctor availability deleted successfully.', id: deleteResponse.rows[0].id });
    } 
    catch (error) {
        console.error('Error deleting doctor availability:', error.stack);
        res.status(500).json({ message: 'Server error deleting doctor availability.' });
    }
};