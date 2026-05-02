// src/models/StaffModel.js

import pool from "../config/db.js";

export const findStaffById = async (id) => {
  const query =  `
    SELECT 
      s.id, s.user_id, s.first_name, s.last_name, s.phone_number,
      s.address, s.date_of_birth, s.gender, s.photo_url,
      s.role, s.specialization,
      u.username, u.email, u.is_active, u.last_login
    FROM staffs s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

export const findAllStaff = async (filters) => {
  const { role, search } = filters;
  
  let query = `
    SELECT 
      s.id, s.user_id, s.first_name, s.last_name, s.phone_number,
      s.address, s.date_of_birth, s.gender, s.photo_url,
      s.role, s.specialization,
      u.username, u.email, u.is_active, u.last_login
    FROM staffs s
    JOIN users u ON s.user_id = u.id
  `;
  
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`s.role = $${paramIndex++}`);
    queryParams.push(role);
  }

  if (search) {
    conditions.push(`(u.username ILIKE $${paramIndex} OR s.first_name ILIKE $${paramIndex} OR s.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY s.last_name ASC';

  const res = await pool.query(query, queryParams);
  return res.rows;
};

export const createStaff = async (client, staffData, userId, role) => {
  const { first_name, last_name, phone_number, address, date_of_birth, gender, specialization } = staffData;

  const query = `
    INSERT INTO staffs (
      user_id, first_name, last_name, phone_number, address, date_of_birth, gender, specialization, role
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id;
  `;

  const values = [
    userId,
    first_name,
    last_name,
    phone_number || null,
    address || null,
    date_of_birth || null,
    gender || null,
    role === 'doctor' ? specialization : null,
    role
  ];

  const result = await client.query(query, values);
  return result.rows[0].id;
};

export const findStaffByUserId = async (userId) => {
  const query = `
    SELECT
      s.id, s.user_id, s.first_name, s.last_name, s.phone_number,
      s.address, s.date_of_birth, s.gender, s.photo_url,
      s.role, s.specialization,
      u.username, u.email, u.is_active, u.last_login
    FROM staffs s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};


export const updateStaffProfile = async (staffId, data, client = pool) => {
  const { first_name, last_name, phone_number, address, date_of_birth, gender, specialization, role } = data;

  const query = `
    UPDATE staffs
    SET 
      first_name = $1, last_name = $2, phone_number = $3, address = $4,
      date_of_birth = $5, gender = $6, specialization = $7, role = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *;
  `;
  const values = [
    first_name, last_name, phone_number, address,
    date_of_birth, gender, specialization, role,
    staffId
  ];
  
  const res = await client.query(query, values);
  return res.rows[0];
};