// src/controllers/adminController.js

import {
  getDashboardStatsService,
  getAppointmentStatusCountsService
} from '../services/AdminService.js';

export async function getAdminStats(req, res) {
  try {

    const stats = await getDashboardStatsService();

    res.status(200).json(stats);

  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.stack);
    res.status(500).json({ message: 'Server error when fetching admin statistics.' });
  }
}

export async function getAppointmentStatusCounts(req, res) {
  try {
    const counts = await getAppointmentStatusCountsService();

    res.status(200).json(counts);
  } catch (error) {
    console.error('Error fetching appointment status counts:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointment status counts.' });
  }
}