const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const path = require('path');
const fs = require('fs/promises');

const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

exports.registerUser = async (req, res) => {
  const { username, password, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (role === 'doctor' && !specialization) {
    return res.status(400).json({ message: 'Specialization is required for doctors.' });
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

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: sanitizeUser(newUser.rows[0]),
    });
  } 
  catch (error) {
    console.error('Error registering user:', error.stack);
    if (error.code === '23502' && error.constraint === 'users_role_check') {
      return res.status(400).json({ message: 'Invalid user role provided.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
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
      queryParams.push(`%${search}%`);
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
    res.status(500).json({ message: 'Server error when fetching users.' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url FROM users WHERE id = $1', // Added is_active, last_login, photo_url
      [id]
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
  const { username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, password } = req.body;

  try {
    const currentUserResult = await pool.query('SELECT role, password_hash FROM users WHERE id = $1', [id]);

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentRole = currentUserResult.rows[0].role;
    let passwordHash = currentUserResult.rows[0].password_hash;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    if ((role === 'doctor' || currentRole === 'doctor') && !specialization) {
      return res.status(400).json({ message: 'Specialization is required for doctors.' });
    }

    const finalSpecialization = (role === 'doctor' || currentRole === 'doctor') ? specialization : null;

    const updatedUser = await pool.query(
      `UPDATE users
       SET username = $1, password_hash = $2, role = $3, first_name = $4, last_name = $5, email = $6,
           phone_number = $7, address = $8, date_of_birth = $9, gender = $10, specialization = $11
       WHERE id = $12
       RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url`,
      [username, passwordHash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, finalSpecialization, id]
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

    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid data format provided.' });
    } 
    else if (error.code === '23505') {
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

    if (error.code === '23503') {
      return res.status(400).json({ message: 'Cannot delete user due to existing related records (e.g., appointments, clinical notes).' });
    }
    res.status(500).json({ message: 'Server error when deleting user.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url AS profile_picture FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json(sanitizeUser(user.rows[0]));
  } 
  catch (error) {
    console.error('Error fetching user profile:', error.stack);
    res.status(500).json({ message: 'Server error when fetching user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, phone_number, address, username } = req.body;

  try {
    const currentUserResult = await pool.query('SELECT photo_url FROM users WHERE id = $1', [userId]);
    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentPhotoUrl = currentUserResult.rows[0].photo_url;
    let newPhotoUrl = currentPhotoUrl;

    if (req.file) {
      newPhotoUrl = `/uploads/${req.file.filename}`;
      if (currentPhotoUrl && !currentPhotoUrl.startsWith('/default-')) {
        const oldFilePath = path.join(__dirname, '..', '..', 'public', currentPhotoUrl);

        try {
          await fs.unlink(oldFilePath);
          console.log(`Old profile picture deleted: ${oldFilePath}`);
        } 
        catch (unlinkError) {
          console.warn(`Could not delete old profile picture ${oldFilePath}:`, unlinkError.message);
        }
      }
    }


    const updatedUser = await pool.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4, address = $5, username = $6, photo_url = $7
       WHERE id = $8
       RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url AS profile_picture`,
      [first_name, last_name, email, phone_number, address, username, newPhotoUrl, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found after update attempt.' });
    }
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: sanitizeUser(updatedUser.rows[0])
    });

  } catch (error) {
    console.error('Error updating user profile:', error.stack);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A user with this username or email already exists.' });
    }
    res.status(500).json({ message: 'Server error when updating user profile.' });
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

    const userEmail = userExists.rows[0].email;
    // Logic to handle password reset
    res.status(200).json({ message: `Password reset instructions sent to ${userEmail}.` });
  } 
  catch (error) {
    console.error('Error initiating password reset:', error.stack);
    res.status(500).json({ message: 'Server error initiating password reset.' });
  }
};