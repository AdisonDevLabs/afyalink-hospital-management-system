// src/services/staffService.js

import pool from '../config/db.js';
import * as StaffModel from '../models/StaffModel.js';
import * as UserModel from '../models/UserModel.js';
import { hashPassword } from '../utils/authUtil.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllStaffService = async (filters) => {
  return await StaffModel.findAllStaff(filters);
};

export const getStaffByIdService = async (id) => {
  const staff = await StaffModel.findStaffById(id);
  if (!staff) {
    throw new Error('Staff member not found.'); // 404
  }
  return staff;
};

export const updateStaffService = async (staffId, data) => {
  const { username, email, password, ...profileData } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // 1. Get the user_id from the staff_id
    const staff = await StaffModel.findStaffById(staffId);
    if (!staff) {
      throw new Error('Staff member not found.'); // 404
    }
    const userId = staff.user_id;

    // 2. Check for username/email conflicts
    if (username || email) {
      const conflicts = await UserModel.findUserByUsernameOrEmail(username || staff.username, email || staff.email, client);
      const conflictingUser = conflicts.find(u => u.id !== userId);
      if (conflictingUser) {
        throw new Error('Username or email already in use by another account.'); // 409
      }
    }

    // 3. Update Auth Info (users table)
    await UserModel.updateUserAuth(userId, { username, email }, client);

    // 4. Update Password (if provided)
    if (password) {
      const password_hash = await hashPassword(password);
      await UserModel.updateUserPassword(userId, password_hash, client);
    }
    
    // 5. Update Profile Info (staffs table)
    if (profileData.role !== 'doctor') {
      profileData.specialization = null;
    }
    const updatedStaffProfile = await StaffModel.updateStaffProfile(staffId, profileData, client);

    await client.query('COMMIT');

    // Return a complete object
    return { ...updatedStaffProfile, username, email };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error; // Re-throw to be caught by controller
  } finally {
    client.release();
  }
};

export const deleteStaffService = async (staffId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const staff = await StaffModel.findStaffById(staffId);
    if (!staff) {
      throw new Error('Staff member not found.'); // 404
    }
    
    // 1. Delete from staffs
    await client.query('DELETE FROM staffs WHERE id = $1', [staffId]);
    // 2. Delete from users
    await client.query('DELETE FROM users WHERE id = $1', [staff.user_id]);

    await client.query('COMMIT');
    return { id: staffId, message: 'Staff member deleted successfully.' };
  
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23503') { // Foreign key violation
      throw new Error('Cannot delete staff: They are referenced by other records (e.g., appointments).'); // 400
    }
    throw error;
  } finally {
    client.release();
  }
};

export const toggleStaffStatusService = async (staffId, is_active) => {
  if (typeof is_active !== 'boolean') {
    throw new Error('Invalid status provided. Must be true or false.'); // 400
  }
  
  const staff = await StaffModel.findStaffById(staffId);
  if (!staff) {
    throw new Error('Staff member not found.'); // 404
  }

  return await UserModel.setUserActiveStatus(staff.user_id, is_active);
};


export const updateSelfProfileService = async (userId, data, file) => {
  const { first_name, last_name, email, phone_number, address, username } = data;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Check for conflicts
    if (username || email) {
      const conflicts = await UserModel.findUserByUsernameOrEmail(username, email, client);
      const conflictingUser = conflicts.find(u => u.id !== userId);
      if (conflictingUser) {
        throw new Error('Username or email already in use by another account.'); // 409
      }
    }
    
    // 2. Get current profile to find old photo
    // We assume user_id === staff_id for logged-in staff
    const staffProfile = await StaffModel.findStaffById(userId); 
    if (!staffProfile) throw new Error('Profile not found.'); // 404
    const currentPhotoUrl = staffProfile.photo_url;
    let newPhotoUrl = currentPhotoUrl;

    // 3. Handle File Upload
    if (file) {
      newPhotoUrl = `/uploads/${file.filename}`;
      if (currentPhotoUrl) {
        const oldFilePath = path.join(__dirname, '..', '..', 'public', currentPhotoUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (unlinkError) {
          console.warn(`Could not delete old profile picture: ${unlinkError.message}`);
        }
      }
    }

    // 4. Update Auth (users table)
    await client.query('UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [username, email, userId]);
    
    // 5. Update Profile (staffs table)
    const profileQuery = `
      UPDATE staffs
      SET first_name = $1, last_name = $2, phone_number = $3, address = $4, photo_url = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const profileRes = await client.query(profileQuery, [first_name, last_name, phone_number, address, newPhotoUrl, userId]);

    await client.query('COMMIT');
    
    // 6. Return combined, sanitized data
    const updatedProfile = profileRes.rows[0];
    updatedProfile.username = username;
    updatedProfile.email = email;
    updatedProfile.profile_picture = newPhotoUrl;
    // We don't need to sanitize password_hash because it was never queried
    
    return updatedProfile;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const resetStaffPasswordService = async (staffId) => {
  // Find the staff member's profile and user data
  const staff = await StaffModel.findStaffById(staffId);
  
  if (!staff) {
    throw new Error('Staff member not found.'); // 404
  }

  // We have the user's email from the join
  const userEmail = staff.email;

  //
  // TODO: Add your email sending logic here
  // (e.g., generate a token, save to DB, send email with a link)
  //
  
  console.log(`Password reset initiated for ${staff.username} (${userEmail})`);

  return { message: `Password reset instructions sent to ${userEmail}.` };
};