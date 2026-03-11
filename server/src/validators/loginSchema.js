// src/validators/loginSchema.js

import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const loginSchema = z.object({
  login: z.string().trim().min(1, { message: "Username or email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});