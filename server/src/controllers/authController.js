const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

exports.registerUser = async (req, res) => {
  const { username, password, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Please enter all required fields: username, password, and email.' });
  }

  if (role === 'doctor' && !specialization) {
    return res.status(400).json({ message: 'Specialization is required for doctors.' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with that username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization`,
      [username, passwordHash, role || 'patient', first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization]
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

  } catch (error) {
    console.error('Error registering user:', error.stack);
    if (error.code === '23502' && error.constraint === 'users_role_check') {
      return res.status(400).json({ message: 'Invalid user role provided.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter username and password.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, photo_url FROM users WHERE username = $1',
      [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    console.log('user role: ', user.role)

    // DUAL_FACTOR CHECK FOR ADMINS ACCESS
    if (user.role === "admin") {
      const keyResult = await pool.query(
        "SELECT key_value FROM system_configs WHERE key_name = 'ADMIN_MACHINE_KEY'"
      );

      const ADMIN_KEY_HASH_DB = keyResult.rows.length > 0 ? keyResult.rows[0].key_value : null;
      const ADMIN_KEY_HASH_ENV = process.env.ADMIN_MACHINE_KEY;

      if (!ADMIN_KEY_HASH_DB || !ADMIN_KEY_HASH_ENV) {
        return res.status(403).json({
          message: "Invalid credentials."
        });
      }
      const isMatch = await bcrypt.compare(ADMIN_KEY_HASH_ENV, ADMIN_KEY_HASH_DB);

      if (!isMatch) {
        return res.status(403).json({
          message: "Admin login not allowed."
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const sanitizedUser = sanitizeUser(user);

    if (sanitizedUser.photo_url) {
        sanitizedUser.profile_picture = sanitizedUser.photo_url;
        delete sanitizedUser.photo_url;
    }

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: sanitizedUser,
      isDemoMode: process.env.DEMO_MODE === 'true'
    });

  } catch (error) {
    console.error('Error logging in user:', error.stack);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, photo_url FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const user = userResult.rows[0];
    const sanitizedUser = sanitizeUser(user);

    if (sanitizedUser.photo_url) {
        sanitizedUser.profile_picture = sanitizedUser.photo_url;
        delete sanitizedUser.photo_url;
    }

    res.status(200).json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user profile:', error.stack);
    res.status(500).json({ message: 'Server error when fetching profile.' });
  }
};