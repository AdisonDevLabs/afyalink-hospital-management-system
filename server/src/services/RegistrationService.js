// src/services/RegistrationService.js

import { createPatient } from "../models/PatientModel.js";
import { createPatientUser } from "../models/UserModel.js";
import { hashPassword } from "../utils/authUtil.js";
import pool from "../config/db.js";

// Creates both a patient record and an active user account atomatically

export const selfRegisterPatient = async (registrationData) => {
  // Seperates data for patient and user tables
  const {
    password, confirm_password,
    username, email, ...patientDemographics
  } = registrationData;

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const password_hash = await hashPassword(password);

    const patientId = await createPatient(client, patientDemographics);

    const userData = {
      username: username,
      email: email,
      password_hash: password_hash,
      patientId: patientId
    };

    const userId = await createPatientUser(client, userData);

    await client.query('COMMIT');

    return { patientId, userId };
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error("Self-Registration failed. Rolled back.", error.message);
    throw new Error("Patient self-registration failed due to a database error.");
  } finally {
    if (client) {
      client.release();
    }
  }
};