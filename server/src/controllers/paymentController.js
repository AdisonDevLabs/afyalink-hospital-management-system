// backend/src/controllers/paymentController.js

const pool = require('../config/db'); // Assuming your PostgreSQL connection pool

// --- Get today's total revenue ---
exports.getTodayRevenue = async (req, res) => {
  try {
    // Get today's date in 'YYYY-MM-DD' format for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to start of tomorrow

    // Query to sum all completed payments for today
    // Assumes a 'payments' table with 'amount' (numeric) and 'payment_date' (timestamp) columns
    const query = `
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE payment_date >= $1 AND payment_date < $2 AND status = 'completed';
    `;
    const queryParams = [today.toISOString(), tomorrow.toISOString()];

    const result = await pool.query(query, queryParams);
    const totalRevenue = result.rows[0].total_revenue;

    res.status(200).json({ total_revenue: parseFloat(totalRevenue) }); // Ensure it's a number

  } catch (error) {
    console.error('Error fetching today\'s revenue:', error.stack);
    res.status(500).json({ message: 'Server error when fetching today\'s revenue.', error: error.message });
  }
};

// --- Get count of pending payments ---
exports.getPendingPaymentsCount = async (req, res) => {
  try {
    // Query to count payments with 'pending' status
    // Assumes a 'payments' table with a 'status' column
    const query = `
      SELECT COUNT(*) AS count
      FROM payments
      WHERE status = 'pending';
    `;

    const result = await pool.query(query);
    const count = result.rows[0].count;

    res.status(200).json({ count: parseInt(count, 10) }); // Ensure it's an integer

  } catch (error) {
    console.error('Error fetching pending payments count:', error.stack);
    res.status(500).json({ message: 'Server error when fetching pending payments count.', error: error.message });
  }
};

// You can add more payment-related functions here (e.g., processPayment, getPaymentDetails)