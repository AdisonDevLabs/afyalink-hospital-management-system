// server/src/controllers/clinicalNoteController.js

const pool = require('../config/db');

exports.createClinicalNote = async (req, res) => {
  const creator_user_id = req.user.id;
  const creator_role = req.user.role;

  const { patient_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes, note_type, appointment_id } = req.body;

  if (!patient_id || !chief_complaint || !notes || !note_type) {
    return res.status(400).json({ message: 'Missing required fields: patient ID, chief complaint, notes, and note type.' });
  }

  const allowedNoteTypes = ['Consultation', 'Progress Note', 'Discharge Summary'];

  if (!allowedNoteTypes.includes(note_type)) {
    return res.status(400).json({ message: 'Invalid note type provided.' });
  }

  try {
    const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);

    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    if (appointment_id) {
        const appointmentRes = await pool.query(
            'SELECT id, patient_id FROM appointments WHERE id = $1',
            [appointment_id]
        );
        if (appointmentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Provided appointment ID not found.' });
        }
        if (appointmentRes.rows[0].patient_id !== patient_id) {
            return res.status(400).json({ message: 'Appointment does not belong to the specified patient.' });
        }
    }

    if (creator_role === 'nurse' && note_type !== 'Progress Note') {
        return res.status(403).json({ message: 'Nurses can only create "Progress Note" type clinical notes.' });
    }

    const newNote = await pool.query(
      `INSERT INTO clinical_notes (patient_id, doctor_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes, note_type, appointment_id)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [patient_id, creator_user_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes, note_type, appointment_id]
    );
    res.status(201).json({
      message: 'Clinical note created successfully.',
      note: newNote.rows[0]
    });

  } catch (error) {
    console.error('Error creating clinical note:', error.stack);

    if (error.code === '23503') {
        if (error.constraint === 'clinical_notes_patient_id_fkey') {
            return res.status(400).json({ message: 'Invalid patient ID provided.' });
        }

        if (error.constraint === 'clinical_notes_doctor_id_fkey') {
            return res.status(400).json({ message: 'Invalid doctor ID provided.' });
        }

        if (error.constraint === 'fk_appointment') {
            return res.status(400).json({ message: 'Invalid appointment ID provided.' });
        }
    }
    res.status(500).json({ message: 'Server error when creating clinical note.' });
  }
};

exports.getClinicalNotesByPatient = async (req, res) => {
  const { patientId } = req.params;
  const { role: user_role, id: user_id } = req.user;

  // Validate ID format
  if (isNaN(patientId) || parseInt(patientId, 10) <= 0) {
    return res.status(400).json({ message: 'Invalid patient ID format.' });
  }

  try {
    let authorizationCheckQuery = 'SELECT id, assigned_nurse_id FROM patients WHERE id = $1';
    const patientResult = await pool.query(authorizationCheckQuery, [patientId]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Check if current user is authorized to view this patient's notes.
    if (user_role === 'nurse' && patientResult.rows[0].asigned_nurse_id !== user_id) {
      return res.status(403).json({ message: 'Access Denied. You are not assigned to this patient.' });
    }

    if (user_role === 'doctor' && !req.query.allow_all) {

    }
    const notes = await pool.query(
      `SELECT
        cn.id, cn.visit_datetime, cn.chief_complaint, cn.diagnosis,
        cn.medications_prescribed,cn.vitals,cn.notes,cn.note_type,
        cn.created_at, cn.updated_at, cn.doctor_id, cn.appointment_id,
        u.username AS doctor_username, u.first_name AS doctor_first_name, u.last_name AS doctor_last_name,
        a.appointment_date, a.appointment_time, a.status AS appointment_status, a.reason AS appointment_reason
      FROM clinical_notes cn
      JOIN users u ON cn.doctor_id = u.id
      LEFT JOIN appointments a ON cn.appointment_id = a.id
      WHERE cn.patient_id = $1
      ORDER BY cn.visit_datetime DESC`, [patientId]
    );
    res.status(200).json(notes.rows);

  } catch (error) {
    console.error('Error fetching clinical notes by patient:', error.stack);
    res.status(500).json({ message: 'Server error when fetching clinical notes.' });
  }
};

exports.getClinicalNoteById = async (req, res) => {
  const { id, patientId } = req.params;


  // Validate ID format
  if (isNaN(patientId) || parseInt(patientId, 10) <= 0) {
    return res.status(400).json({ message: 'Invalid patient ID format.' });
  }

  try {
    const note = await pool.query(
      `SELECT
        cn.id,
        cn.patient_id,
        cn.doctor_id,
        cn.visit_datetime,
        cn.chief_complaint,
        cn.diagnosis,
        cn.medications_prescribed,
        cn.vitals,
        cn.notes,
        cn.note_type,
        cn.created_at,
        cn.updated_at,
        cn.appointment_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        u.username AS doctor_username,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name,
        a.appointment_date,
        a.appointment_time,
        a.status AS appointment_status,
        a.reason AS appointment_reason
      FROM clinical_notes cn
      JOIN patients p ON cn.patient_id = p.id
      JOIN users u ON cn.doctor_id = u.id
      LEFT JOIN appointments a ON cn.appointment_id = a.id
      WHERE cn.id = $1`, [id]
    );
    if (note.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }
    res.status(200).json(note.rows[0]);

  } catch (error) {
    console.error('Error fetching clinical note by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching clinical note.' });
  }
};

exports.updateClinicalNote = async (req, res) => {
  const { id } = req.params;
  const { chief_complaint, diagnosis, medications_prescribed, vitals, notes, note_type, appointment_id } = req.body;
  const current_user_id = req.user.id;
  const current_user_role = req.user.role;

  if (vitals && typeof vitals === 'object') {
    req.body.vitals = JSON.stringify(vitals);
  }
  if (medications_prescribed && typeof medications_prescribed) {
    req.body.medications_prescribed = JSON.stringify(medications_prescribed);
  }

  try {
    const currentNote = await pool.query('SELECT doctor_id, note_type, patient_id FROM clinical_notes WHERE id = $1', [id]);

    if (currentNote.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }

    const note_author_id = currentNote.rows[0].doctor_id;
    const note_current_type = currentNote.rows[0].note_type;
    const note_patient_id = currentNote.rows[0].patient_id;
    let isAuthorized = false;

    if (current_user_role === 'admin') {
      isAuthorized = true;
    } else if (current_user_role === 'doctor' && current_user_id === note_author_id) {
      isAuthorized = true;
    } else if (current_user_role === 'nurse' && current_user_id === note_author_id && note_current_type === 'Progress Note') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this clinical note. Only the authoring doctor/nurse (for Progress Notes) or an administrator can.' });
    }

    if (appointment_id !== undefined) {
        if (appointment_id !== null) {
            const appointmentRes = await pool.query(
                'SELECT id, patient_id FROM appointments WHERE id = $1',
                [appointment_id]
            );

            if (appointmentRes.rows.length === 0) {
                return res.status(404).json({ message: 'Provided appointment ID not found for update.' });
            }

            if (appointmentRes.rows[0].patient_id !== note_patient_id) {
                return res.status(400).json({ message: 'Updated appointment does not belong to the note\'s patient.' });
            }
        }
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (chief_complaint !== undefined) { updateFields.push(`chief_complaint = $${paramIndex++}`); updateValues.push(chief_complaint); }

    if (diagnosis !== undefined) { updateFields.push(`diagnosis = $${paramIndex++}`); updateValues.push(diagnosis); }

    if (medications_prescribed !== undefined) { updateFields.push(`medications_prescribed = $${paramIndex++}`); updateValues.push(medications_prescribed); }

    if (vitals !== undefined) { updateFields.push(`vitals = $${paramIndex++}`); updateValues.push(vitals); }

    if (notes !== undefined) { updateFields.push(`notes = $${paramIndex++}`); updateValues.push(notes); }

    if (note_type !== undefined && ['admin', 'doctor'].includes(current_user_role)) {
      updateFields.push(`note_type = $${paramIndex++}`); updateValues.push(note_type);
    }

    if (appointment_id !== undefined) {
        updateFields.push(`appointment_id = $${paramIndex++}`); updateValues.push(appointment_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const updatedNote = await pool.query(
      `UPDATE clinical_notes
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`,
      updateValues
    );
    res.status(200).json({
      message: 'Clinical note updated successfully.',
      note: updatedNote.rows[0]
    });

  } catch (error) {
    console.error('Error updating clinical note:', error.stack);

    if (error.code === '23503' && error.constraint === 'fk_appointment') {
        return res.status(400).json({ message: 'Invalid appointment ID provided for update.' });
    }
    res.status(500).json({ message: 'Server error when updating clinical note.' });
  }
};

exports.deleteClinicalNote = async (req, res) => {
  const { id } = req.params;
  const current_user_id = req.user.id;
  const current_user_role = req.user.role;

  try {
    const currentNote = await pool.query('SELECT doctor_id FROM clinical_notes WHERE id = $1', [id]);

    if (currentNote.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }

    const note_author_id = currentNote.rows[0].doctor_id;

    if (current_user_role !== 'admin' && current_user_id !== note_author_id) {
      return res.status(403).json({ message: 'Not authorized to delete this clinical note. Only the authoring doctor or an administrator can.' });
    }

    const deleteResponse = await pool.query('DELETE FROM clinical_notes WHERE id = $1 RETURNING id', [id]);
    res.status(200).json({ message: 'Clinical note deleted successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting clinical note:', error.stack);
    res.status(500).json({ message: 'Server error when deleting clinical note.' });
  }
};