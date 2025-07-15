// backend/src/controllers/bedController.js

const pool = require('../config/db');

// --- Get bed occupancy status ---
exports.getBedOccupancy = async (req, res) => {
  try {
    // Assuming a 'beds' table with 'id', 'room_number', 'is_occupied', 'patient_id'
    // and a 'patients' table to join for patient details if needed
    const beds = await pool.query(`
      SELECT
        b.id AS bed_id,
        b.room_number,
        b.bed_number,
        b.is_occupied,
        b.patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name
      FROM beds b
      LEFT JOIN patients p ON b.patient_id = p.id
      ORDER BY b.room_number, b.bed_number ASC
    `);

    // You might want to return aggregated data like total occupied/available beds
    const totalBeds = beds.rows.length;
    const occupiedBeds = beds.rows.filter(bed => bed.is_occupied).length;
    const availableBeds = totalBeds - occupiedBeds;

    res.status(200).json({
      totalBeds,
      occupiedBeds,
      availableBeds,
      bedDetails: beds.rows
    });

  } catch (error) {
    console.error('Error fetching bed occupancy:', error.stack);
    res.status(500).json({ message: 'Server error when fetching bed occupancy.' });
  }
};

// You can add functions for assigning/unassigning beds, etc.