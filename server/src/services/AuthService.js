// src/services/AuthService.js

import { findUserWithProfileByLogin, updateLastLogin, createStaffUser } from "../models/UserModel.js";
import { comparePasswords, generateToken, hashPassword } from "../utils/authUtil.js";
import { findPatientById } from "../models/PatientModel.js";
import { findStaffById, createStaff } from "../models/StaffModel.js";
import pool from "../config/db.js";

export const loginUserService = async (login, password) => {
  const data = await findUserWithProfileByLogin(login);

  if (!data) {
    throw new Error('Invalid credentials.');
  }

  if (!data.is_active) {
    throw new Error('Account is deactivated. Please contact support.');
  }

  const isMatch = await comparePasswords(password, data.password_hash);

  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  let userProfile = {};
  let profileId = null;

  if (data.staff_profile_id) {
    profileId = data.staff_profile_id;
    userProfile = {
      id: data.staff_profile_id,
      user_id: data.user_id,
      first_name: data.staff_first_name,
      last_name: data.staff_last_name,
      username: data.username,
      email: data.auth_email,
      role: data.role,
      specialization: data.specialization,
      profile_picture: data.staff_photo_url || null
    };

  } else if (data.patient_profile_id) {
    profileId = data.patient_profile_id;
    userProfile = {
      id: data.patient_profile_id,
      user_id: data.user_id,
      first_name: data.patient_first_name,
      last_name: data.patient_last_name,
      username: data.username,
      email: data.auth_email,
      contact_email: data.patient_contact_email,
      role: 'patient',
      profile_picture: data.patient_photo_url || null
    };

  } else {
    throw new Error('Login error: User profile not found.');
  }

  const tokenPayload = {
    id: data.user_id,
    role: data.role,
    profile_id: profileId
  };
  
  const token = generateToken(tokenPayload);

  updateLastLogin(data.user_id);

  return { token, user: userProfile };
};


// Service for Staff Registration
export const registerStaffService = async (registrationData) => {
  const { password, username, email, role, ...staffProfileData } = registrationData;
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Create Auth User
    const password_hash = await hashPassword(password);
    const userData = { username, email, password_hash, role };
    const userId = await createStaffUser(client, userData);

    // 2. Create Staff Profile
    const staffId = await createStaff(client, staffProfileData, userId, role);

    await client.query('COMMIT');

    // Return the new staff profile data
    return {
      id: staffId,
      user_id: userId,
      username,
      email,
      role,
      first_name: staffProfileData.first_name,
      last_name: staffProfileData.last_name
    };

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error("Staff registration failed. Rolled back.", error.message);
    // Re-throw to be caught by the controller
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};


// ---------------------------------------------
// --- getProfileService function ---
// ---------------------------------------------
export const getProfileService = async (profileId, role) => {
  let profile;
  if (role === 'patient') {
    profile = await findPatientById(profileId);
  } else {
    profile = await findStaffById(profileId);
  }

  if (!profile) {
    throw new Error('Profile not found.');
  }

  if (profile.photo_url) {
    profile.profile_picture = profile.photo_url;
    delete profile.photo_url;
  }

  delete profile.password_hash;

  return profile;
};