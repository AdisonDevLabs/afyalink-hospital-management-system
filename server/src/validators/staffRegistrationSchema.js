// src/validators/staffRegistrationSchema.js

import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const staffRegistrationSchema = z.object({
  first_name: z.string().trim().min(2, { message: "First name is required" }),
  last_name: z.string().trim().min(2, { message: "Last name is required" }),
  username: z.string().min(4, { message: "Username is required" }),
  email: z.email({ message: "Email is required"}),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` })
    .regex(/[A-Z]/, { message: "Password must contain at lease one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9\s]/, { message: "Password must contain at least one special character." }),
  role: z.enum(["admin", "doctor", "receptionist", "nurse", "guest"]),
  phone_number: z.string().trim().min(10, { message: "Phone number must be atleast 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date of birth must be a valid format (YYYY-MM-DD)."
  }),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender selection is required."
  }),
  specialization: z.string().optional(),
}).refine(data => data.role !== 'doctor' || (data.role === 'doctor' && data.specialization), {
  message: "Specialization is required for doctors.",
  path: ["specialization"],
});