const pool = require('../config/db');

exports.getVitalsNeedingUpdate = async (req, res) => {
  const nurse_id = req.user.id;
  const { status } = req.query;

  if (!nurse_id) {
    return res.status(400).json({ message: 'Nurse ID is required.' });
  }

  try {
    let query = `
      SELECT
        v.id,
        v.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        v.body_temperature,
        v.pulse_rate,
        v.blood_pressure_systolic,
        v.blood_pressure_diastolic,
        v.respiration_rate,
        v.oxygen_saturation,
        v.weight,
        v.height,
        v.bmi,
        v.recorded_at,
        v.notes,
        v.status
      FROM vitals v
      JOIN patients p ON v.patient_id = p.id
      WHERE v.recorded_by = $1`;

    const queryParams = [nurse_id];

    if (status) {
      query += ` AND v.status = $2`;
      queryParams.push(status);
    }

    query += ` ORDER BY v.recorded_at ASC`;
    const vitals = await pool.query(query, queryParams);
    res.status(200).json(vitals.rows);
  } 
  catch (error) {
    console.error('Error fetching vitals needing update:', error.stack);
    res.status(500).json({ message: 'Error fetching vitals needing update: Internal Server Error' });
  }
};

exports.getRecordedVitalsCount = async (req, res) => {
  const nurse_id = req.user.id;
  const { date } = req.query;

  if (!nurse_id) {
    return res.status(400).json({ message: 'Nurse ID is required.' });
  }

  if (!date) {
    return res.status(400).json({ message: 'Date is required for recorded vitals count.' });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT COUNT(*) AS count
      FROM vitals
      WHERE recorded_by = $1
        AND recorded_at >= $2
        AND recorded_at <= $3;
    `;
    const result = await pool.query(query, [nurse_id, startOfDay.toISOString(), endOfDay.toISOString()]);
    res.status(200).json({ count: parseInt(result.rows[0].count, 10) });

  } catch (error) {
    console.error('Error fetching recorded vitals count:', error.stack);
    res.status(500).json({ message: 'Server error when fetching recorded vitals count.' });
  }
};