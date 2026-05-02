// src/models/UserModel.js

import pool from '../config/db.js';

export const createPatientUser = async (client, userData) => {
  const {
    username,
    password_hash,
    email,
  } = userData;

  // The link back to patients is stored in patients.user_id, not here.
  const query = `
    INSERT INTO users (
      username, password_hash, role, email, is_active
    )
    VALUES ($1, $2, 'patient', $3, true)
    RETURNING id;
  `;

  const values = [
    username,
    password_hash,
    email,
  ];

  const result = await client.query(query, values);

  return result.rows[0].id;
};

// ----------------------------------------------
// --- create staff function ---
// ----------------------------------------------

export const createStaffUser = async(client, userData) => {
  const { username, password_hash, email, role } = userData;

  const query = `
    INSERT INTO users
      (username, password_hash, email, is_active, role)
    VALUES ($1, $2, $3, true, $4)
    RETURNING id;
  `;

  const values = [username, password_hash, email, role];
  const result = await client.query(query, values);
  return result.rows[0].id;
};

export const findUserByUsernameOrEmail = async (username, email, client = pool) => {
  const query = 'SELECT * FROM users WHERE username = $1 OR email = $2';
  const res = await client.query(query, [username, email]);
  return res.rows;
};


export const findUserWithProfileByLogin = async (login) => {
  const query = `
    SELECT
      u.id AS user_id, u.username, u.email AS auth_email,
      u.password_hash, u.is_active,
      s.id AS staff_profile_id, s.first_name AS staff_first_name, s.last_name AS staff_last_name, s.role,
      s.photo_url AS staff_photo_url, s.specialization,
      p.id AS patient_profile_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.email AS patient_contact_email,
      p.photo_url AS patient_photo_url
    FROM users u
    LEFT JOIN staffs s ON u.id = s.user_id
    LEFT JOIN patients p ON u.id = p.user_id
    WHERE u.username = $1 OR u.email = $1
  `;

  const result = await pool.query(query, [login]);
  return result.rows[0];
};

export const updateLastLogin = async (userId) => {
  pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId])
    .catch(err => console.error('Error updating last_login:', err));
};

export const updateUserAuth = async (userId, data, client = pool) => {
  const { username, email } = data;
  const query = `
    UPDATE users
    SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, username, email;
  `;
  const res = await client.query(query, [username, email, userId]);
  return res.rows[0];
};

export const updateUserPassword = async (userId, password_hash, client = pool) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id;
  `;
  await client.query(query, [password_hash, userId]);
};

export const setUserActiveStatus = async (userId, is_active, client = pool) => {
  const query = 'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, username, is_active';
  const res = await client.query(query, [is_active, userId]);
  return res.rows[0];
};