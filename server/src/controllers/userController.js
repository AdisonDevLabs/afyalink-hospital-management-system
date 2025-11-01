// server/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const path = require('path');
const fs = require('fs/promises');

const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
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
  const { first_name, last_name, email, phone_number, address, username, password } = req.body;

  try {
    const currentUserResult = await pool.query('SELECT photo_url FROM users WHERE id = $1', [userId]);
    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentPhotoUrl = currentUserResult.rows[0].photo_url;
    let newPhotoUrl = currentPhotoUrl;
    let passwordUpdate = '';
    let passwordHash = null;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
      passwordUpdate = 'password_hash = $9,';
    }

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
       SET first_name = $1, last_name = $2, email = $3, phone_number = $4, address = $5, username = $6, photo_url = $7, ${passwordUpdate} updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender, specialization, is_active, last_login, photo_url AS profile_picture`,
      password ? [first_name, last_name, email, phone_number, address, username, newPhotoUrl, userId, passwordHash] : [first_name, last_name, email, phone_number, address, username, newPhotoUrl, userId]
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