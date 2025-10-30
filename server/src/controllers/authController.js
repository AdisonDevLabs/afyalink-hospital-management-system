// server/src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const sanitizeUser = (user) => {
  const { password_hash, photo_url, ...rest } = user;

  // Return the user object without the hash, adding the preferred key
  return {
    ...rest,
    profile_picture: photo_url || null
  };
};

exports.registerUser = async (req, res) => {

  if (req.isDemoMode) {
    return res.status(403).json({
      message: 'User registration is desabled in Demo Mode.'
    });
  }
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

// --- Main Login Controller ---
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Basic Input Validation
  if (!username || !password) {
    return res.status(400).json({
      message: 'Please enter username and password.'
    });
  }
  
  // --- Check for Demo Login Attemp ---
  // If a user tries to login with a known demo user, handle it specifically.
  if (username === 'demo' && password === 'demo') {
    const demoPayload = { id: 0, role: 'guest_demo', username: 'demo_user' };
    const demoToken = jwt.sign(demoPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set HttpOnly Cookie for the 'guest_demo' role
    res.cookie('auth_token', demoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Welcome to DemoMode.',
      user: { id: 0, role: 'guest_demo', username: 'demo_user' },
      isDemoMode: true,
    });
  }

  // ----------------------------------
  // --- Standard User Login Flow ---
  // ----------------------------------

  try {
    const userResult = await pool.query(
      // Ensure role is fetched correctly
      'SELECT id, username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, photo_url FROM users WHERE username = $1', [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    // DUAL_FACTOR CHECK FOR ADMIN ACCESS
    if (user.role === "admin") {
      const keyResult = await pool.query(
        "SELECT key_value FROM system_configs WHERE key_name = 'ADMIN_MACHINE_KEY'"
      );

      const ADMIN_KEY_HASH_DB = keyResult.rows.length > 0 ? keyResult.rows[0].key_value : null;
      const ADMIN_KEY_VALUE_ENV = process.env.ADMIN_MACHINE_KEY;

      // Ensure both exists before comparing
      if (!ADMIN_KEY_HASH_DB || !ADMIN_KEY_VALUE_ENV) {
        console.error('ADMIN DUAL-FACTOR FAIL: System key configuration missing.');
        return res.status(403).json({
          message: "Admin authentication failed."
        });
      }

      const adminKeyMatch = await bcrypt.compare(ADMIN_KEY_VALUE_ENV, ADMIN_KEY_HASH_DB);

      if (!adminKeyMatch) {
        console.warn(`ADMIN DUAL-FACTOR FAIL: Environment key mismatch for user: ${username}`);
        return res.status(403).json({
          message: "Admin login not authorized from this machine."
        });
      }
    }

    // Generate Token and Set HttpOnly Cookie
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username }, // Include username for convenience
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set the JWT in an HttpOnly Cookie (As required by authMiddleware.js/protect)
    res.cookie('auth_token', token, {
      httpOnly: true, // For security
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', // CSRF defense
      maxAge: 24 * 60 * 60 * 1000,
    });

    const sanitizedUser =sanitizeUser(user);

    // Send Sanitized User Data
    // Do NOT send the JWT token in the body as it's already in the cookie.
    res.status(200).json({
      message: 'Logged in successfully.',
      user: sanitizedUser,
      isDemoMode: false
    });

  } catch (error) {
    console.error('Error logging in user:', error.stack);
    res.status(500).json({
      message: 'Server error during login.'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {

    if (req.isDemoMode) {
      return res.status(200).json({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@afyalink.com',
        isDemoMode: true
      });
    }
    
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

exports.logoutUser = (req, res) => {
  // Clear the HttpOnly cookie
  res.clearCookie('auth_token');

  res.status(200).json({
    message: 'Logged out successfully.'
  });
};