const pool = require('../config/db');

const isDoctor = async (userID) => {
  if (isNaN(parseInt(userID))) {
    return false;
  }
  const userResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [userID]);
  return userResult.rows.length > 0 && userResult.rows[0].role === 'doctor';
};
const departmentExists = async (departmentID) => {
  if (isNaN(parseInt(departmentID))) {
    return false;
  }
  const result = await pool.query('SELECT id FROM departments WHERE id = $1', [departmentID]);
  return result.rows.length > 0;
};

exports.createAppointment = async (req, res) => {
  let { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status } = req.body;
  patient_id = (typeof patient_id === 'string' && patient_id.trim() === '') ? null : parseInt(patient_id);
  doctor_id = (typeof doctor_id === 'string' && doctor_id.trim() === '') ? null : parseInt(doctor_id);
  department_id = (typeof department_id === 'string' &&department_id.trim() === '') ? null : parseInt(department_id)
  if (!patient_id || !doctor_id || !department_id || !appointment_date || !appointment_time || !reason) {
    console.error('Validation failed: Missing or invalid required appointment fields.');
    return res.status(400).json({ message: 'Missing or invalid required appointment fields: patient ID, doctor ID, date, time, reason.' });
  }
  if (isNaN(patient_id) || isNaN(doctor_id) || isNaN(department_id)) {
      console.error('Validation failed: IDs are NaN after parsing.');
      return res.status(400).json({ message: 'Invalid patient ID or doctor ID format provided.' });
  }
  try {
    const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientExists.rows.length === 0) {
      console.error('Validation failed: Patient not found.');
      return res.status(400).json({ message: 'Patient not found.' });
    }
    if (!(await isDoctor(doctor_id))) {
      console.error('Validation failed: Invalid doctor ID or user is not a doctor.');
      return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor.' });
    }
    if (!(await departmentExists(department_id))) {
        console.error('Validation failed: Department not found.');
        return res.status(400).json({ message: 'Department not found.' });
    }
    const doctorSchedule = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'Scheduled'`,
      [doctor_id, appointment_date, appointment_time]
    );
    if (doctorSchedule.rows.length > 0) {
      console.error('Validation failed: Doctor already booked.');
      return res.status(409).json({ message: 'Doctor is already booked at this time slot.' });
    }
    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Scheduled')) RETURNING *`,
      [patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status]
    );
    console.log('Appointment created successfully.');
    res.status(201).json({
      message: 'Appointment created successfully.',
      appointment: newAppointment.rows[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error.stack);
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid patient or doctor ID provided (foreign key violation).' });
    } else if (error.code === '22P02') {
        return res.status(400).json({ message: 'Invalid data format provided for patient or doctor ID.' });
    }
    res.status(500).json({ message: 'Server error when creating appointment.' });
  } finally {
  }
};

exports.getAllAppointments = async (req, res) => {
  const { patient_id, doctor_id, date, status } = req.query;
  let query = `
  SELECT
    a.id,
    a.patient_id,
    a.doctor_id,
    a.department_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    u.username AS doctor_username,
    u.first_name AS doctor_first_name,
    u.last_name AS doctor_last_name,
    d.name AS department_name
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN users u ON a.doctor_id = u.id
  JOIN departments d ON a.department_id = d.id
  WHERE 1=1
  `;
  const queryParams = [];
  let paramIndex = 1;

  if (patient_id) {
    query += ` AND a.patient_id = $${paramIndex++}`;
    queryParams.push(patient_id);
  }
  if (doctor_id) {
    query += ` AND a.doctor_id = $${paramIndex++}`;
    queryParams.push(doctor_id);
  }
  if (date) {
    query += ` AND a.appointment_date = $${paramIndex++}`;
    queryParams.push(date);
  }
  if (status) {
    query += ` AND a.status = $${paramIndex++}`;
    queryParams.push(status);
  }

  query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;

  try {
    const appointments = await pool.query(query, queryParams);
    res.status(200).json(appointments.rows);

  } catch (error) {
    console.error('Error fetching appointments:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointments.' });
  }
};

exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await pool.query(
      `SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.department_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.reason,
        p.id AS patient_id_from_patient_table,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        u.id AS doctor_id_from_user_table,
        u.username AS doctor_username,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name,
        d.name AS department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      JOIN departments d ON a.department_id = d.id
      WHERE a.id = $1`,
      [id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.status(200).json(appointment.rows[0]);

  } catch (error) {
    console.error('Error fetching appointment by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointment by ID.' });
  }
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  let { patient_id, doctor_id, department_id,  appointment_date, appointment_time, status, reason } = req.body;

  try {
    patient_id = (typeof patient_id === 'string' && patient_id.trim() === '') ? null : parseInt(patient_id);
    doctor_id = (typeof doctor_id === 'string' && doctor_id.trim() === '') ? null : parseInt(doctor_id);
    department_id = (typeof department_id === 'string' && department_id.trim() === '') ? null : parseInt(department_id);

    if (patient_id !== null && isNaN(patient_id)) {
      console.error('Validation failed: Invalid patient ID format (NaN).');
      return res.status(400).json({ message: 'Invalid patient ID format.' });
    }
    
    if (doctor_id !== null && isNaN(doctor_id)) {
      console.error('Validation failed: Invalid doctor ID format (NaN).');
      return res.status(400).json({ message: 'Invalid doctor ID format.' });
    }

    if (department_id !== null && isNaN(department_id)) {
        console.error('Validation failed: Invalid department ID format (NaN).');
        return res.status(400).json({ message: 'Invalid department ID format.' });
    }

    if (patient_id !== null) {
      const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
      if (patientExists.rows.length === 0) {
        console.error('Validation failed: Patient not found for provided ID.');
        return res.status(404).json({ message: 'Patient not found.' });
      }
    }

    if (doctor_id !== null) {
      if (!(await isDoctor(doctor_id))) {
        console.error('Validation failed: Invalid doctor ID or user is not a doctor for provided ID.');
        return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor.' });
      }
    }

    if (department_id !== null) {
        if (!(await departmentExists(department_id))) {
            console.error('Validation failed: Department not found for provided ID.');
            return res.status(404).json({ message: 'Department not found.' });
        }
    }

    const currentAppointmentResult = await pool.query('SELECT doctor_id, appointment_date, appointment_time FROM appointments WHERE id = $1', [id]);

    if (currentAppointmentResult.rows.length === 0) {
        console.error('Appointment not found for update.');
        return res.status(404).json({ message: 'Appointment not found.' });
    }

    const currentAppointment = currentAppointmentResult.rows[0];
    const checkDoctorID = doctor_id !== null ? doctor_id : currentAppointment.doctor_id;
    const checkDate = appointment_date || (currentAppointment.appointment_date ?
    (currentAppointment.appointment_date instanceof Date ?
    currentAppointment.appointment_date.toISOString().split('T')[0] :
    currentAppointment.appointment_date) : null);
    const checkTime = appointment_time || currentAppointment.appointment_time;

    if (checkDoctorID && checkDate && checkTime) {
      const doctorSchedule = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND id != $4 AND status = 'Scheduled'`,
        [checkDoctorID, checkDate, checkTime, id]
      );

      if (doctorSchedule.rows.length > 0) {
        console.error('Validation failed: Doctor already booked at this new time slot.');
        return res.status(409).json({ message: 'Doctor is already booked at this new time slot.' });
      }
    }

    const updateAppointmentResult = await pool.query(
      `UPDATE appointments
      SET patient_id = COALESCE($1, patient_id),
          doctor_id = COALESCE($2, doctor_id),
          department_id = COALESCE($3, department_id),
          appointment_date = COALESCE($4, appointment_date),
          appointment_time = COALESCE($5, appointment_time),
          status = COALESCE($6, status),
          reason = COALESCE($7, reason),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [patient_id, doctor_id, department_id, appointment_date, appointment_time, status, reason, id]
    );

    if (updateAppointmentResult.rows.length === 0) {
      console.error('Appointment not found after update attempt (no rows returned).');
      return res.status(404).json({ message: 'Appointment not found after update attempt.' });
    }
    console.log('Appointment updated successfully.');
    res.status(200).json({
      message: 'Appointment updated successfully.',
      appointment: updateAppointmentResult.rows[0]
    });

  } catch (error) {
    console.error('Error updating appointment:', error.stack);

    if (error.code === '22P02') {
        return res.status(400).json({ message: 'Invalid data format provided for patient or doctor ID.' });
    } else if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid patient or doctor ID provided for update (foreign key violation).' });
    } else if (error.code === '23505') {
      return res.status(409).json({ message: 'A conflict occurred: possibly an overlapping appointment or duplicate entry.' });
    }
    res.status(500).json({ message: 'Server error when updating appointment.' });
    
  } finally {
  }
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting appointment.', error.stack);
    res.status(500).json({ message: 'Server error when deleting appointment.' });
  }
};
