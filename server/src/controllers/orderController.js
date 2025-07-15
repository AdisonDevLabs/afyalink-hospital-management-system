// backend/src/controllers/orderController.js

const pool = require('../config/db');

// --- Get new doctor orders for a specific nurse or ward ---
exports.getNewDoctorOrders = async (req, res) => {
  const nurse_id = req.user.id;

  if (!nurse_id) {
    return res.status(400).json({ message: 'Nurse ID is required.' });
  }

  try {
    const query = `
      SELECT
        o.id,
        o.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        o.doctor_id,
        u_doc.first_name AS doctor_first_name,
        u_doc.last_name AS doctor_last_name,
        o.order_type,
        o.details,
        o.order_time,
        o.status
      FROM orders o
      JOIN patients p ON o.patient_id = p.id
      JOIN users u_doc ON o.doctor_id = u_doc.id
      WHERE o.assigned_nurse_id = $1 AND o.status = 'new'
      ORDER BY o.order_time ASC;
    `;
    const result = await pool.query(query, [nurse_id]);

    const orders = result.rows.map(order => ({
      ...order,
      patient_name: `${order.patient_first_name} ${order.patient_last_name}`,
      doctor_name: `${order.doctor_first_name} ${order.doctor_last_name}`
    }));

    res.status(200).json({ orders: orders });

  } catch (error) {
    console.error('Error fetching new doctor orders:', error.stack);
    res.status(500).json({ message: 'Server error when fetching new doctor orders.' });
  }
};