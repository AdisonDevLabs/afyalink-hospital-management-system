const pool = require('../config/db');

exports.getLabReports = async (req, res) => {
  const { doctor_id, patient_id, status } = req.query;
  let query = 'SELECT * FROM lab_reports WHERE 1=1';
  const queryParams = [];
  let paramIndex = 1;

  if (doctor_id) {
    query += ` AND doctor_id = $${paramIndex++}`;
    queryParams.push(doctor_id);
  }

  if (patient_id) {
    query += ` AND patient_id = $${paramIndex++}`;
    queryParams.push(patient_id);
  }

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    queryParams.push(status);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const { rows } = await pool.query(query, queryParams);
    res.status(200).json(rows);
  } 
  catch (error) {
    console.error('Error fetching lab reports:', error.stack);
    res.status(500).json({ message: 'Server error fetching lab reports.' });
  }
};

exports.createLabReport = async (req, res) => {
  const { patient_id, doctor_id, test_name, results, status, notes } = req.body;

  if (!patient_id || !doctor_id || !test_name) {
    return res.status(400).json({ message: 'Patient, doctor, and test name are required.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO lab_reports (patient_id, doctor_id, test_name, results, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patient_id, doctor_id, test_name, results || null, status || 'pending', notes || null]
    );
    res.status(201).json({ message: 'Lab report created successfully.', labReport: rows[0] });
  } 
  catch (error) {
    console.error('Error creating lab report:', error.stack);
    res.status(500).json({ message: 'Server error creating lab report.' });
  }
};

exports.getLabReportById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query('SELECT * FROM lab_reports WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lab report not found.' });
    }
    res.status(200).json(rows[0]);
  } 
  catch (error) {
    console.error('Error fetching lab report by ID:', error.stack);
    res.status(500).json({ message: 'Server error fetching lab report.' });
  }
};

exports.updateLabReport = async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, test_name, results, status, notes } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE lab_reports SET patient_id = $1, doctor_id = $2, test_name = $3, results = $4, status = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [patient_id, doctor_id, test_name, results, status, notes, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lab report not found.' });
    }
    res.status(200).json({ message: 'Lab report updated successfully.', labReport: rows[0] });
  } 
  catch (error) {
    console.error('Error updating lab report:', error.stack);
    res.status(500).json({ message: 'Server error updating lab report.' });
  }
};

exports.deleteLabReport = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM lab_reports WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Lab report not found.' });
    }
    res.status(200).json({ message: 'Lab report deleted successfully.' });
  } 
  catch (error) {
    console.error('Error deleting lab report:', error.stack);
    res.status(500).json({ message: 'Server error deleting lab report.' });
  }
};