// backend/src/controllers/medicationController.js

const pool = require('../config/db');

// --- Get medications due for a specific nurse ---
exports.getDueMedications = async (req, res) => {
  const nurse_id = req.user.id;
  const { status } = req.query; // Expecting status='due_now' or similar

  if (!nurse_id) {
    return res.status(400).json({ message: 'Nurse ID is required.' });
  }

  try {
    let query = `
      SELECT
        m.id,
        m.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        m.medication_name,
        m.dosage AS dose,
        'mg' AS unit, -- Placeholder, add 'unit' column to medications table if needed
        'Daily' AS frequency, -- Placeholder, add 'frequency' column if needed
        m.administration_time AS due_time, -- Assuming administration_time is the due_time
        m.status,
        m.notes
      FROM medications m
      JOIN patients p ON m.patient_id = p.id
      WHERE m.assigned_nurse_id = $1`;

    const queryParams = [nurse_id];
    let paramIndex = 2;

    if (status) {
      query += ` AND m.status = $${paramIndex++}`;
      queryParams.push(status);
    } else {
      query += ` AND m.status IN ('scheduled', 'due')`;
    }

    query += ` ORDER BY m.administration_time ASC`;

    const medications = await pool.query(query, queryParams);

    const formattedMedications = medications.rows.map(med => ({
      ...med,
      patient_name: `${med.patient_first_name} ${med.patient_last_name}`
    }));

    res.status(200).json({ medications: formattedMedications });

  } catch (error) {
    console.error('Error fetching due medications:', error.stack);
    res.status(500).json({ message: 'Server error when fetching due medications.' });
  }
};

// --- Get count of medications administered by a specific nurse today ---
exports.getAdministeredMedicationsCount = async (req, res) => {
  const nurse_id = req.user.id;
  const { date } = req.query;

  if (!nurse_id) {
    return res.status(400).json({ message: 'Nurse ID is required.' });
  }
  if (!date) {
    return res.status(400).json({ message: 'Date is required for administered count.' });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT COUNT(*) AS count
      FROM medications
      WHERE assigned_nurse_id = $1
        AND status = 'administered'
        AND administration_time >= $2
        AND administration_time <= $3;
    `;
    const result = await pool.query(query, [nurse_id, startOfDay.toISOString(), endOfDay.toISOString()]);

    res.status(200).json({ count: parseInt(result.rows[0].count, 10) });

  } catch (error) {
    console.error('Error fetching administered medications count:', error.stack);
    res.status(500).json({ message: 'Server error when fetching administered medications count.' });
  }
};

// --- Mark a medication as administered ---
exports.markMedicationAsAdministered = async (req, res) => {
  const { medicationId } = req.params;
  const nurse_id = req.user.id;

  if (!medicationId) {
    return res.status(400).json({ message: 'Medication ID is required.' });
  }
  if (!nurse_id) {
    return res.status(401).json({ message: 'Unauthorized: Nurse ID not found.' });
  }

  try {
    const result = await pool.query(
      `UPDATE medications
       SET status = 'administered',
           administration_time = CURRENT_TIMESTAMP,
           administered_by_nurse_id = $2
       WHERE id = $1 AND assigned_nurse_id = $2 AND status IN ('scheduled', 'due')
       RETURNING *;`,
      [medicationId, nurse_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Medication not found, already administered, or not assigned to this nurse.'
      });
    }

    res.status(200).json({
      message: 'Medication marked as administered successfully.',
      medication: result.rows[0]
    });

  } catch (error) {
    console.error('Error marking medication as administered:', error.stack);
    res.status(500).json({ message: 'Server error when marking medication as administered.' });
  }
};