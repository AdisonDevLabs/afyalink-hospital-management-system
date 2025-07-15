// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Helper to sanitize user output (remove password hash)
const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, password, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization } = req.body;

  // Basic validation
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Please enter all required fields: username, password, and email.' });
  }

  // Validate specialization for doctors
  if (role === 'doctor' && !specialization) {
    return res.status(400).json({ message: 'Specialization is required for doctors.' });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with that username or email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization`,
      [username, passwordHash, role || 'patient', first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization]
    );

    // Generate token
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

  } catch (error) {
    console.error('Error registering user:', error.stack);
    if (error.code === '23502' && error.constraint === 'users_role_check') {
      return res.status(400).json({ message: 'Invalid user role provided.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter username and password.' });
  }

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization FROM users WHERE username = $1',
      [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error('Error logging in user:', error.stack);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // The user ID is available from the protect middleware (req.user.id)
    const userResult = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization FROM users WHERE id = $1',
      [req.user.id] // Assuming req.user.id is populated by the authentication middleware
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json(sanitizeUser(userResult.rows[0]));
  } catch (error) {
    console.error('Error fetching user profile:', error.stack);
    res.status(500).json({ message: 'Server error when fetching profile.' });
  }
};