// src/utils/authUtils.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import env from '../config/env.js';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password is required for hashing.');
  }
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to securely hash password.');
  }
};

export const comparePasswords = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};