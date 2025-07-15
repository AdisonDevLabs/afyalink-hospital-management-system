// backend/src/controllers/alertController.js

const pool = require('../config/db');

// --- Get alerts for a specific recipient role ---
exports.getAlertsByRecipientRole = async (req, res) => {
  const { recipient_role } = req.query; // e.g., 'nurse', 'doctor', 'admin'
  const userId = req.user.id; // The ID of the currently logged-in user

  if (!recipient_role) {
    return res.status(400).json({ message: 'Recipient role is required.' });
  }

  try {
    let query = `
      SELECT
        a.id,
        a.message,
        a.severity,
        a.created_at,
        a.is_read,
        a.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name
      FROM alerts a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.recipient_role = $1`;

    const queryParams = [recipient_role];

    // Optionally, if alerts are also user-specific, you might add:
    // AND (a.recipient_user_id IS NULL OR a.recipient_user_id = $2)
    // if a.recipient_user_id is also a field in your alerts table.
    // For now, we'll stick to role-based filtering as per the original error.

    query += ` ORDER BY a.created_at DESC`;

    const alerts = await pool.query(query, queryParams);

    res.status(200).json(alerts.rows);

  } catch (error) {
    console.error('Error fetching alerts:', error.stack);
    res.status(500).json({ message: 'Server error when fetching alerts.' });
  }
};

// ---------------------
exports.getAlerts = async (req, res) => {
  const { recipient_id, severity } = req.query;

  if (!recipient_id) {
    return res.status(400).json({ message: 'Recipient ID is required.' });
  }

  try {
    let query = `
      SELECT
        a.id,
        a.message,
        a.severity,
        a.created_at,
        a.is_read,
        a.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name
      FROM alerts a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.recipient_user_id = $1`;

    const queryParams = [recipient_id];
    let paramIndex = 2;

    if (severity) {
      query += ` AND a.severity = $${paramIndex}`;
      // Consider adding .toUpperCase() or .toLowerCase() here if your DB stores severity consistently
      // e.g., queryParams.push(severity.toUpperCase());
      queryParams.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC`;
  

    const alerts = await pool.query(query, queryParams);

    res.status(200).json(alerts.rows);

  } catch (error) {
    console.error('Error fetching alerts:', error.stack);
    // --- IMPORTANT: This detailed error message helps diagnose 400s ---
    res.status(400).json({ message: 'Failed to fetch alerts: ' + error.message });
  }
};

// You can add functions for creating alerts, marking alerts as read, etc.