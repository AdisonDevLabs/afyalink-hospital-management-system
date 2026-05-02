import { patientRegistrationSchema } from '../validators/patientRegistrationSchema.js';
import { selfRegisterPatient } from '../services/RegistrationService.js';
import { loginUserService, getProfileService, registerStaffService } from '../services/AuthService.js';
import { updateSelfProfileService } from '../services/StaffService.js';
import { generateToken } from '../utils/authUtil.js';


export async function registerPatient(req, res) {
  const validationResult = patientRegistrationSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationResult.error.issues
    });
  }

  try {
    const { patientId, userId } = await selfRegisterPatient(validationResult.data);

    // Post-Registration: Generate JWT for immediate login
    const token = generateToken({ id: userId, role: 'patient', profile_id: patientId });

    // Send minimal info for immediate usage.
    res.status(201).json({
      message: 'Patient registered successfully.',
      token,
      user: {
        id: userId,
        profile_id: patientId,
        role: 'patient',
        username: validationResult.data.username,
        email: validationResult.data.email
      },
    });

  } catch (error) {
    console.error('Error during patient self-registration.', error.stack);

    if (error.message.includes('duplicate key value')) {
      return res.status(409).json({ message: 'User with username or email already exists.' });
    }

    res.status(500).json({ message: 'Server error during registration.' });
  }
}


export async function registerStaff(req, res) {
  // Note: Validation is handled upstream by validate(staffRegistrationSchema) middleware.
  try {
    const newStaffUser = await registerStaffService(req.body);

    res.status(201).json({
      message: 'Staff user registered successfully.',
      user: newStaffUser,
    });
  } catch (error) {
    console.error('Error during staff registration.', error.stack);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'User with that username or email already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
}


export async function loginUser(req, res) {
  const { login, password } = req.body;

  try {
 
    const { token, user } = await loginUserService(login, password);

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user,
    });

  } catch (error) {
    console.error('Error logging in user:', error.stack);

    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ message: error.message });
    }
    if (error.message.includes('deactivated')) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes('profile not found')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during login.' });
  }
}

export async function getProfile(req, res) {
  try {
    const { profile_id, role } = req.user;

    const profile = await getProfileService(profile_id, role);

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error.stack);

    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when fetching profile.' });
  }
}


export async function updateProfile(req, res) {
  try {
    // Get user_id (the auth ID) from the 'protect' middleware
    const userId = req.user.id; 
    
    // The service handles file I/O, transactions, etc.
    const updatedUser = await updateSelfProfileService(userId, req.body, req.file);
    
    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('already in use')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when updating profile.' });
  }
}
