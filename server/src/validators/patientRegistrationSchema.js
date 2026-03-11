// src/validators/patientRegistrationSchema.js

import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const patientRegistrationSchema = z.object({
  first_name: z.string().trim().min(2, { message: "First name required." }),
  last_name: z.string().trim().min(2, { message: "Last name required." }),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date of birth must be a valid format (YYYY-MM-DD)."
  }),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender selection is required."
  }),
  contact_phone: z.string().trim().min(10, { message: "Contact must be atleast 10 digits." }),
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(4, { message: "Username is required." }),

  password: z.string()
    .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` })
    .regex(/[A-Z]/, { message: "Password must contain at lease one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9\s]/, { message: "Password must contain at least one special character." }),

  confirm_password: z.string().min(1, { message: "Please confirm your password." }),

  national_id: z.string().optional().or(z.literal('')),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),

  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_phone: z.string().optional().or(z.literal('')),
  emergency_contact_relationship: z.string().optional().or(z.literal('')),
})

.refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match.",
  path: ["confirm_password"],
});