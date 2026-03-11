// src/models/PatientModel.js

import pool from "../config/db.js"; 

export const createPatient = async (client, patientData) => {
  // Destructure and prepare patient data for patients table
  const {
    first_name, last_name, date_of_birth, gender,
    contact_phone, email, national_id, address,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
  } = patientData;

  const query = `
    INSERT INTO patients (
      first_name, last_name, date_of_birth, gender,
      contact_phone, email, national_id, address,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id;
  `;

  // Define the values array
  const values = [
    first_name, last_name, date_of_birth, gender,
    contact_phone, email, national_id || null, address,
    emergency_contact_name || null, emergency_contact_phone || null, emergency_contact_relationship || null
  ];

  const result = await pool.query(query, values);

  return result.rows[0].id;
}

export const findPatientById = async (id) => {
  const query = `
    SELECT
      id, first_name, last_name, date_of_birth, gender, contact_phone,
      email, national_id, address, photo_url, is_admitted,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, user_id
    FROM patients WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};