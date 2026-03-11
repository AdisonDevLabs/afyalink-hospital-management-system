// src/controllers/staffController.js

import * as StaffService from '../services/StaffService.js';

/**
 * Controller to get all staff members.
 * GET /api/v1/staff
 */
export async function getAllStaff(req, res) {
  try {
    const filters = {
      role: req.query.role,
      search: req.query.search
    };
    const staff = await StaffService.getAllStaffService(filters);
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error.stack);
    res.status(500).json({ message: 'Server error when fetching staff.' });
  }
}

/**
 * Controller to get a single staff member by ID.
 * GET /api/v1/staff/:id
 */
export async function getStaffById(req, res) {
  try {
    const { id } = req.params;
    const staff = await StaffService.getStaffByIdService(id);
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff by ID:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when fetching staff.' });
  }
}

/**
 * Controller to update a staff member.
 * PUT /api/v1/staff/:id
 */
export async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const updatedStaff = await StaffService.updateStaffService(id, req.body);
    res.status(200).json({
      message: 'Staff member updated successfully.',
      user: updatedStaff
    });
  } catch (error) {
    console.error('Error updating staff:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('already in use')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when updating staff.' });
  }
}

/**
 * Controller to delete a staff member.
 * DELETE /api/v1/staff/:id
 */
export async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    const result = await StaffService.deleteStaffService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting staff:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when deleting staff.' });
  }
}

/**
 * Controller to toggle a staff member's active status.
 * PATCH /api/v1/staff/:id/status
 */
export async function toggleStaffStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const user = await StaffService.toggleStaffStatusService(id, is_active);
    res.status(200).json({
      message: `User status set to ${is_active ? 'active' : 'inactive'}.`,
      user
    });
  } catch (error) {
    console.error('Error toggling staff status:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error when toggling status.' });
  }
}


export async function resetStaffPassword(req, res) {
  try {
    const { id } = req.params;
    const result = await StaffService.resetStaffPasswordService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error initiating password reset:', error.stack);
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error initiating password reset.' });
  }
}