// server/src/controllers/adminController.js

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Utility to remove sensitive fields
const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
}

// ------------------------------------------------
// --- Admin Dashboard Statistics ---
// --------------------------------------------

exports.getAdminStats = async (req, res) => {
  try {
    const totalPatientsResult = await pool.query('SELECT COUNT(*) FROM patients');
    const totalPatients = parseInt(totalPatientsResult.rows[0].count, 10);
    const totalDoctorsResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'doctor'");
    const totalDoctors = parseInt(totalDoctorsResult.rows[0].count, 10);
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointmentsResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE appointment_date = $1 AND status = $2',
      [today, 'Scheduled']
    );
    const todaysAppointments = parseInt(todaysAppointmentsResult.rows[0].count, 10);
    const revenueSummary = 15000;
    res.status(200).json({
      totalPatients,
      totalDoctors,
      todaysAppointments,
      revenueSummary,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.stack);
    res.status(500).json({ message: 'Server error when fetching admin statistics.' });
  }
};

exports.getAppointmentStatusCounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching appointment status counts:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointment status counts.' });
  }
};

// ----------------------------------
// -- Admin User Management ---
// ----------------------------------

exports.registerUser = async (req, res) => {

  const { username, password, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (role === 'doctor' && !specialization) {
    return res.status(400).json({ message: 'specialization is required for doctors.' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with that username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE) RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active`,
      [username, passwordHash, role || 'receptionist', first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization]
    );
    res.status(201).json({
      message: 'User registered successfully.',
      user: sanitizeUser(newUser.rows[0]),
    });
  }
  catch (error) {
    console.error('Error registering user:', error.stack);
    if (error.code === 23505) {
      return res.status(409).json({ message: 'A user with this username already exists.' });
    }
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.body;
    let query = 'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url FROM users';

    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      queryParams.push(role);
    }
    if (search) {
      conditions.push(`(username ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY username ASC';

    const users = await pool.query(query, queryParams);
    res.status(200).json(users.rows);
  }
  catch (error) {
    console.error('Error fetching users:', error.stack);
    res.status(500).json({ message: 'Server error when fetching.' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url FROM users id = $1', [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user.rows[0]);
  }
  catch (error) {
    console.error('Error fetching user by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching user.' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, password, is_active } = req.body;

  try {
    const currentUserResult = await pool.query('SELECT role, password_hash FROM users WHERE id = $1', [id]);

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentRole = currentUserResult.rows[0].role;
    let passwordHash = currentUserResult.rows[0].password_hash;

    // Password Update Logic
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Specialization Validation
    const effectiveRole = role || currentRole;
    if (effectiveRole === 'doctor' && !specialization) {
      return res.status(400).json({ message: 'Specialization is required for doctors.' });
    }
    const finalSpecialization = (effectiveRole === 'doctor') ? specialization : null;

    const updatedUser = await pool.query(
      `UPDATE user
      SET username = COALENCE($1, username),
        password_hash = COALESCE($2, password_hash),
        role = COALESCE($3, role),
        first_name = COALESCE($4, first_name),
        last_name = COALESCE($5, last_name),
        email = COALESCE($6, email),
        phone_number = COALESCE($7, phone_number),
        address = COALESCE($8, address),
        date_of_birth = COALESCE($9, date_of_birth),
        gender = COALESCE($10, gender),
        specialization = $11,
        is_active = COALESCE($12, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url`,
      [username, passwordHash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, finalSpecialization, is_active, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
      message: 'User updated successfully.',
      user: sanitizeUser(updatedUser.rows[0])
    });
  }
  catch (error) {
    console.error('Error updating user:', error.stack);

    if (error.code === '23505') {
      return res.status(409).json({ message: 'A user with this username already exists.' });
    }
    res.status(500).json({ message: 'Server error when updating user.' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.', id: deleteResponse.rows[0].id });
  }
  catch (error) {
    console.error('Error deleting user:', error.stack);

    if (error.code === '26503') {
      return res.status(400).json({ message: 'Cannot delete user due to existing related records (e.g., appointments, clinical notes). Remove associations first.' });
    }
    res.status(500).json({ message: 'Server error when deleting user.' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'Invalid status provided. Must be true or false.' });
  }

  try {
    const updatedUser = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, username, is_active',
      [is_active, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
      message: `User status set to ${is_active ? 'active' : 'inactive'} successfully.`,
      user: updatedUser.rows[0]
    });
  }
  catch (error) {
    console.error('Error toggling user status:', error.stack);
    res.status(500).json({ message: 'Server error when toggling user status.' });
  }
};

exports.resetUserPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const userExists = await pool.query('SELECT id, email, username FROM users WHERE id = $1', [id]);

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userEmail = userExists.rows[0].email || 'N/A';
    res.status(200).json({ message: `Password reset request initiated for user ${id}. If email exists, instructions would be sent to ${userEmail}.` });
  }
  catch (error) {
    console.error('Error initiating password reset:', error.stack);
    res.status(500).json({ message: 'Server error initiating password reset.' });
  }
};