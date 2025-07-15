// backend/src/controllers/appointmentController.js

const pool = require('../config/db');

// Validate if user is a doctor
const isDoctor = async (userID) => {
  // Ensure userID is a number, otherwise it'll fail the query or be interpreted incorrectly
  if (isNaN(parseInt(userID))) {
    return false;
  }
  const userResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [userID]);
  return userResult.rows.length > 0 && userResult.rows[0].role === 'doctor';
};

// Validate if department_id exists
const departmentExists = async (departmentID) => {
  if (isNaN(parseInt(departmentID))) {
    return false;
  }
  const result = await pool.query('SELECT id FROM departments WHERE id = $1', [departmentID]);
  return result.rows.length > 0;
};

// --- Create new appointment ---
exports.createAppointment = async (req, res) => {
  // console.log('--- DEBUG: createAppointment start ---');
  // console.log('Received req.body for createAppointment:', req.body);

  let { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status } = req.body;

  // Explicitly handle empty strings from frontend dropdowns or unselected fields
  patient_id = (typeof patient_id === 'string' && patient_id.trim() === '') ? null : parseInt(patient_id);
  doctor_id = (typeof doctor_id === 'string' && doctor_id.trim() === '') ? null : parseInt(doctor_id);
  department_id = (typeof department_id === 'string' &&department_id.trim() === '') ? null : parseInt(department_id)

  //console.log('Parsed patient_id:', patient_id, 'Parsed doctor_id:', doctor_id, 'Parsed department_id:', department_id);
  //console.log('appointment_date:', appointment_date, 'appointment_time:', appointment_time, 'reason:', reason);

  // Validate required fields and parsed IDs (null patient_id/doctor_id will be caught by !patient_id)
  if (!patient_id || !doctor_id || !department_id || !appointment_date || !appointment_time || !reason) {
    console.error('Validation failed: Missing or invalid required appointment fields.');
    return res.status(400).json({ message: 'Missing or invalid required appointment fields: patient ID, doctor ID, date, time, reason.' });
  }

  // Validate if parsed IDs are indeed numbers (non-null and not NaN)
  if (isNaN(patient_id) || isNaN(doctor_id) || isNaN(department_id)) {
      console.error('Validation failed: IDs are NaN after parsing.');
      return res.status(400).json({ message: 'Invalid patient ID or doctor ID format provided.' });
  }

  try {
    // Validate if patient_id exists
    const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientExists.rows.length === 0) {
      console.error('Validation failed: Patient not found.');
      return res.status(400).json({ message: 'Patient not found.' });
    }
    // Validate if doctor_id exists and is actually a 'doctor'
    if (!(await isDoctor(doctor_id))) {
      console.error('Validation failed: Invalid doctor ID or user is not a doctor.');
      return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor.' });
    }
    // ⭐ MODIFICATION: Validate if department_id exists
    if (!(await departmentExists(department_id))) {
        console.error('Validation failed: Department not found.');
        return res.status(400).json({ message: 'Department not found.' });
    }

    // Check for doctor's availability at the specified time and date
    // Only check against 'Scheduled' appointments to avoid conflicts with completed/cancelled ones
    const doctorSchedule = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'Scheduled'`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (doctorSchedule.rows.length > 0) {
      console.error('Validation failed: Doctor already booked.');
      return res.status(409).json({ message: 'Doctor is already booked at this time slot.' });
    }

    // Insert new appointment into database
    // ⭐ MODIFICATION: Add department_id to INSERT query
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
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ message: 'Invalid patient or doctor ID provided (foreign key violation).' });
    } else if (error.code === '22P02') { // Invalid text representation (e.g., trying to parse non-numeric ID)
        return res.status(400).json({ message: 'Invalid data format provided for patient or doctor ID.' });
    }
    res.status(500).json({ message: 'Server error when creating appointment.' });
  } finally {
      //console.log('--- DEBUG: createAppointment end ---');
  }
};

// --- Get all appointments (with optional filters) ---
exports.getAllAppointments = async (req, res) => {
  const { patient_id, doctor_id, date, status } = req.query;

  let query = `
  SELECT
    a.id,
    a.patient_id,    -- Include patient_id for frontend lookup
    a.doctor_id,     -- Include doctor_id for frontend lookup
    a.department_id, -- ⭐ MODIFICATION: Include department_id
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    u.username AS doctor_username,
    u.first_name AS doctor_first_name,
    u.last_name AS doctor_last_name,
    d.name AS department_name -- ⭐ MODIFICATION: Include department_name
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN users u ON a.doctor_id = u.id
  JOIN departments d ON a.department_id = d.id -- ⭐ MODIFICATION: Join departments table
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
    query += ` AND a.status = $${paramIndex++}`; // Corrected paramIndex increment
    queryParams.push(status);
  }

  query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`; // Fixed typo: a,appointment_time -> a.appointment_time

  try {
    const appointments = await pool.query(query, queryParams);
    res.status(200).json(appointments.rows);

  } catch (error) {
    console.error('Error fetching appointments:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointments.' });
  }
};

// --- Get appointment by ID ---
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
        p.id AS patient_id_from_patient_table, -- Alias to avoid conflict with a.patient_id
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        u.id AS doctor_id_from_user_table,   -- Alias to avoid conflict with a.doctor_id
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

// --- Update appointment ---
exports.updateAppointment = async (req, res) => {
  //console.log('--- DEBUG: updateAppointment start ---');
  //console.log('Received req.body for updateAppointment:', req.body);
  //console.log('Appointment ID:', req.params.id);

  const { id } = req.params;
  let { patient_id, doctor_id, department_id,  appointment_date, appointment_time, status, reason } = req.body;

  try {
    // Convert IDs to numbers. If they are empty strings, convert to null.
    // This handles cases where dropdown's default option (value="") is sent.
    patient_id = (typeof patient_id === 'string' && patient_id.trim() === '') ? null : parseInt(patient_id);
    doctor_id = (typeof doctor_id === 'string' && doctor_id.trim() === '') ? null : parseInt(doctor_id);
    department_id = (typeof department_id === 'string' && department_id.trim() === '') ? null : parseInt(department_id);

    //console.log('Parsed patient_id:', patient_id, 'Parsed doctor_id:', doctor_id);
    //console.log('appointment_date:', appointment_date, 'appointment_time:', appointment_time, 'reason:', reason, 'status:', status);

    // Validate if parsed IDs are indeed numbers (non-null and not NaN)
    if (patient_id !== null && isNaN(patient_id)) {
      console.error('Validation failed: Invalid patient ID format (NaN).');
      return res.status(400).json({ message: 'Invalid patient ID format.' });
    }
    if (doctor_id !== null && isNaN(doctor_id)) {
      console.error('Validation failed: Invalid doctor ID format (NaN).');
      return res.status(400).json({ message: 'Invalid doctor ID format.' });
    }
        // ⭐ MODIFICATION: Validate department_id format if provided
    if (department_id !== null && isNaN(department_id)) {
        console.error('Validation failed: Invalid department ID format (NaN).');
        return res.status(400).json({ message: 'Invalid department ID format.' });
    }

    // Validate foreign keys if new IDs are provided (not null)
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
        // ⭐ MODIFICATION: Validate department_id existence if provided
    if (department_id !== null) {
        if (!(await departmentExists(department_id))) {
            console.error('Validation failed: Department not found for provided ID.');
            return res.status(404).json({ message: 'Department not found.' });
        }
    }

    // Fetch current appointment details to preserve unchanged values for availability check
    const currentAppointmentResult = await pool.query('SELECT doctor_id, appointment_date, appointment_time FROM appointments WHERE id = $1', [id]);
    if (currentAppointmentResult.rows.length === 0) {
        console.error('Appointment not found for update.');
        return res.status(404).json({ message: 'Appointment not found.' }); // Primary appointment not found
    }
    const currentAppointment = currentAppointmentResult.rows[0];

    //console.log('Current appointment details for availability check:', currentAppointment);


    // Determine the values to use for the availability check (use new values if provided, else current)
    const checkDoctorID = doctor_id !== null ? doctor_id : currentAppointment.doctor_id;
    // For date/time, ensure they are in string format for comparison/query.
    // currentAppointment.appointment_date might be a Date object or string depending on driver config.
    const checkDate = appointment_date || (currentAppointment.appointment_date ?
                                           (currentAppointment.appointment_date instanceof Date ?
                                            currentAppointment.appointment_date.toISOString().split('T')[0] :
                                            currentAppointment.appointment_date) : null);
    const checkTime = appointment_time || currentAppointment.appointment_time;

    //console.log('Values used for availability check: DoctorID=', checkDoctorID, 'Date=', checkDate, 'Time=', checkTime);


    // Doctor availability check logic (only if essential elements are available)
    // Only check 'Scheduled' appointments and exclude the current appointment being updated
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

    // Perform the update
    const updateAppointmentResult = await pool.query(
      `UPDATE appointments
      SET patient_id = COALESCE($1, patient_id),
          doctor_id = COALESCE($2, doctor_id),
          department_id = COALESCE($3, department_id), -- ⭐ NEW: Update department_id
          appointment_date = COALESCE($4, appointment_date),
          appointment_time = COALESCE($5, appointment_time),
          status = COALESCE($6, status),
          reason = COALESCE($7, reason),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [patient_id, doctor_id, department_id, appointment_date, appointment_time, status, reason, id] // ⭐ NEW: Add department_id here
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
    if (error.code === '22P02') { // Invalid text representation (e.g., trying to parse non-numeric ID)
        return res.status(400).json({ message: 'Invalid data format provided for patient or doctor ID.' });
    } else if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ message: 'Invalid patient or doctor ID provided for update (foreign key violation).' });
    } else if (error.code === '23505') { // Unique violation (e.g., if you had a unique constraint on doctor+date+time)
      return res.status(409).json({ message: 'A conflict occurred: possibly an overlapping appointment or duplicate entry.' });
    }
    // Generic 500 for other unhandled errors
    res.status(500).json({ message: 'Server error when updating appointment.' });
  } finally {
      //console.log('--- DEBUG: updateAppointment end ---');
  }
};

// --- Delete Appointment ---
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
