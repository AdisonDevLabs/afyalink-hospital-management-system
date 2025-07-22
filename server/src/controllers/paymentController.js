const pool = require('../config/db');

exports.getTodayRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const query = `
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE payment_date >= $1 AND payment_date < $2 AND status = 'completed';
    `;

    const queryParams = [today.toISOString(), tomorrow.toISOString()];
    const result = await pool.query(query, queryParams);
    const totalRevenue = result.rows[0].total_revenue;

    res.status(200).json({ total_revenue: parseFloat(totalRevenue) });
  } 
  catch (error) {
    console.error('Error fetching today\'s revenue:', error.stack);
    res.status(500).json({ message: 'Server error when fetching today\'s revenue.', error: error.message });
  }
};

exports.getPendingPaymentsCount = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS count
      FROM payments
      WHERE status = 'pending';
    `;

    const result = await pool.query(query);
    const count = result.rows[0].count;
    res.status(200).json({ count: parseInt(count, 10) });
  } 
  catch (error) {
    console.error('Error fetching pending payments count:', error.stack);
    res.status(500).json({ message: 'Server error when fetching pending payments count.', error: error.message });
  }
};