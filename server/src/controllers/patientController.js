const pool = require('../config/db');

exports.createPatient = async (req, res) => {
  const {
    first_name, last_name, date_of_birth, gender, national_id,
    contact_phone, email, address, assigned_nurse_id, photo_url, is_admitted = false,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !gender || !contact_phone) {
    return res.status(400).json({ message: 'Missing required patient fields: first name, last name, date of birth, gender, contact phone.' });
  }

  try {
    if (national_id) {
      const existingPatient = await pool.query('SELECT id FROM patients WHERE national_id = $1', [national_id]);
      if (existingPatient.rows.length > 0) {
        return res.status(409).json({ message: 'Patient with this national ID already exists.' });
      }
    }

    if (email) {
      const existingPatient = await pool.query('SELECT id FROM patients WHERE email = $1', [email]);
      if (existingPatient.rows.length > 0) {
        return res.status(409).json({ message: 'Patient with this email already exists.' });
      }
    }

    const newPatient = await pool.query(
      `INSERT INTO patients (first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address, assigned_nurse_id, photo_url, is_admitted, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address, assigned_nurse_id, photo_url, is_admitted, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship]
    );
    res.status(201).json({
      message: "Patient registered successfully.",
      patient: newPatient.rows[0]
    });
  } 
  catch (error) {
    console.error('Error creating patient:', error.stack);
    if (error.code === '23505') {
        return res.status(409).json({ message: 'Patient with this national ID or email already exists.' });
    }
    res.status(500).json({ message: 'Server error when registering patient.' });
  }
};

exports.getAllPatients = async (req, res) => {
  const { nurse_id, assigned_today } = req.query;
  const queryParams = [];
  let paramIndex = 1;

  let query = `
    SELECT
      p.id,
      p.first_name,
      p.last_name,
      p.date_of_birth,
      p.gender,
      p.national_id,
      p.contact_phone,
      p.email,
      p.address,
      p.created_at,
      p.updated_at,
      p.assigned_nurse_id,
      p.photo_url,
      p.emergency_contact_name,
      p.emergency_contact_phone,
      p.emergency_contact_relationship,
      b.room_number,
      b.bed_number
    FROM patients p
    LEFT JOIN beds b ON p.id = b.patient_id
  `;
  let whereClauses = [];

  if (nurse_id) {
    whereClauses.push(`p.assigned_nurse_id = $${paramIndex++}`);
    queryParams.push(nurse_id);
    whereClauses.push(`p.is_admitted = TRUE`);
  }

  if (assigned_today) {
    const todayStart = new Date(assigned_today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(assigned_today);
    todayEnd.setHours(23, 59, 59, 999);
    whereClauses.push(`p.created_at >= $${paramIndex++}`);
    queryParams.push(todayStart.toISOString());
    whereClauses.push(`p.created_at <= $${paramIndex++}`);
    queryParams.push(todayEnd.toISOString());
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ` ORDER BY p.last_name ASC, p.first_name ASC`;

  try {
    const allPatients = await pool.query(query, queryParams);
    res.status(200).json({ patients: allPatients.rows });
  } catch (error) {
    console.error('Error fetching all patients:', error.stack);
    res.status(500).json({ message: 'Server error when fetching patients.' });
  }
};

exports.getPatientCount = async (req, res) => {
    const { nurse_id } = req.query;
    const queryParams = [];
    let paramIndex = 1;
    let query = 'SELECT COUNT(*) AS count FROM patients p';
    let whereClauses = [];

    if (nurse_id) {
        whereClauses.push(`p.assigned_nurse_id = $${paramIndex++}`);
        queryParams.push(nurse_id);
        whereClauses.push(`p.is_admitted = TRUE`);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    try {
        const result = await pool.query(query, queryParams);
        const count = parseInt(result.rows[0].count, 10);
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching patient count:', error.stack);
        res.status(500).json({ message: 'Server error when fetching patient count.', error: error.message });
    }
};

exports.getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id) || parseInt(id, 10) <= 0) {
      return res.status(400).json({ message: 'Invalid patient ID format.' });
    }

    const patient = await pool.query(
      `SELECT
         p.id,
         p.first_name,
         p.last_name,
         p.date_of_birth,
         p.gender,
         p.national_id,
         p.contact_phone,
         p.email,
         p.address,
         p.created_at,
         p.updated_at,
         p.assigned_nurse_id,
         p.photo_url,
         p.emergency_contact_name,
         p.emergency_contact_phone,
         p.emergency_contact_relationship,
         b.room_number,
         b.bed_number
       FROM patients p
       LEFT JOIN beds b ON p.id = b.patient_id
       WHERE p.id = $1`,
      [id]
    );

    if (patient.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ patient: patient.rows[0] });
  } 
  catch (error) {
    console.error('Error fetching patient by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching patient.' });
  }
};

exports.getRecentPatients = async (req, res) => {
  try {
    const recentPatients = await pool.query(
      `SELECT id, first_name, last_name, created_at
       FROM patients
       ORDER BY created_at DESC
       LIMIT 5`
    );
    res.status(200).json({ patients: recentPatients.rows });
  } 
  catch (error) {
    console.error('Error fetching recent patients:', error.stack);
    res.status(500).json({ message: 'Server error when fetching recent patients.' });
  }
};

exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const {
    first_name, last_name, date_of_birth, gender, national_id,
    contact_phone, email, address, assigned_nurse_id, photo_url, is_admitted,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
  } = req.body;

  try {
    if (national_id) {
      const existing = await pool.query('SELECT id FROM patients WHERE national_id = $1 AND id <> $2', [national_id, id]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'This National ID is already associated with another patient.' });
      }
    }

    if (email) {
      const existing = await pool.query('SELECT id FROM patients WHERE email = $1 AND id <> $2', [email, id]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'This email is already associated with another patient.' });
      }
    }

    const updatedPatient = await pool.query(
      `UPDATE patients SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        date_of_birth = COALESCE($3, date_of_birth),
        gender = COALESCE($4, gender),
        national_id = COALESCE($5, national_id),
        contact_phone = COALESCE($6, contact_phone),
        email = COALESCE($7, email),
        address = COALESCE($8, address),
        assigned_nurse_id = COALESCE($9, assigned_nurse_id),
        photo_url = COALESCE($10, photo_url),
        is_admitted = COALESCE($11, is_admitted),
        emergency_contact_name = COALESCE($12, emergency_contact_name),
        emergency_contact_phone = COALESCE($13, emergency_contact_phone),
        emergency_contact_relationship = COALESCE($14, emergency_contact_relationship),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 RETURNING *`,
      [first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address, assigned_nurse_id, photo_url, is_admitted, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, id]
    );

    if (updatedPatient.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found or no changes made.' });
    }
    res.status(200).json({
      message: 'Patient updated successfully.',
      patient: updatedPatient.rows[0]
    });
  } 
  catch (error) {
    console.error('Error updating patient:', error.stack);
    res.status(500).json({ message: 'Server error when updating patient.' });
  }
};

exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ message: 'Patient deleted successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting patient:', error.stack);

    if (error.code === '23503') {
      return res.status(409).json({ message: 'Cannot delete patient: associated records (e.g., appointments, clinical notes) exist.' });
    }
    res.status(500).json({ message: 'Server error when deleting patient.' });
  }
};