// backend/src/controllers/departmentController.js

const pool = require('../config/db');

// --- Create new department ---
exports.createDepartment = async (req, res) => {
  const { name, description, head_of_department_id } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  try {
    // Check if department name already exists
    const departmentExists = await pool.query(
      'SELECT id FROM departments WHERE name = $1', [name]
    );
    if (departmentExists.rows.length > 0) {
      return res.status(409).json({ message: 'Department with this name already exists.' });
    }

    const newDepartment = await pool.query(
      'INSERT INTO departments (name, description, head_of_department_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, head_of_department_id || null] // Allow null for head_of_department_id
    );
    res.status(201).json({
      message: 'Department created successfully.',
      department: newDepartment.rows[0]
    });
  } catch (error) {
    console.error('Error creating department:', error.stack);
    res.status(500).json({ message: 'Server error when creating department.' });
  }
};

// --- Get count of all departments ---
exports.getDepartmentsCount = async (req, res) => {
  try {
    // Query to count all entries in the 'departments' table
    const query = `
      SELECT COUNT(*) AS count
      FROM departments;
    `;

    console.log('--- DEBUG: Get Departments Count Query ---');
    console.log('Query:', query);
    console.log('--------------------------------------');

    const result = await pool.query(query);
    const count = result.rows[0].count;

    res.status(200).json({ count: parseInt(count, 10) }); // Ensure it's an integer

  } catch (error) {
    console.error('Error fetching departments count:', error.stack);
    res.status(500).json({ message: 'Server error when fetching departments count.', error: error.message });
  }
};

// --- Get all departments with aggregated data ---
exports.getAllDepartments = async (req, res) => {
  try {
    const query = `
      SELECT
          d.id,
          d.name,
          d.description,
          d.created_at,
          d.updated_at,
          d.head_of_department_id,
          COALESCE(h.first_name || ' ' || h.last_name, 'N/A') AS head_of_department_name, -- Concatenate first_name and last_name
          COUNT(DISTINCT CASE WHEN u_doc.role = 'doctor' AND a.department_id = d.id THEN u_doc.id ELSE NULL END) AS doctor_count,
          COUNT(DISTINCT CASE WHEN a.appointment_date = CURRENT_DATE THEN a.patient_id ELSE NULL END) AS patients_today,
          COUNT(DISTINCT CASE WHEN a.appointment_date >= CURRENT_DATE THEN a.id ELSE NULL END) AS scheduled_appointments
      FROM
          departments d
      LEFT JOIN
          users h ON d.head_of_department_id = h.id -- For department head name
      LEFT JOIN
          appointments a ON a.department_id = d.id -- Link appointments to departments
      LEFT JOIN
          users u_doc ON a.doctor_id = u_doc.id AND u_doc.role = 'doctor' -- Link doctors from appointments to users
      GROUP BY
          d.id, h.first_name, h.last_name -- Group by first_name and last_name
      ORDER BY
          d.name ASC;
    `;
    const allDepartments = await pool.query(query);
    // Rename 'doctor_count' to 'staff_count' for frontend consistency, as per the original request
    const departmentsWithStaffCount = allDepartments.rows.map(dept => ({
      ...dept,
      staff_count: dept.doctor_count // Frontend expects 'staff_count'
    }));
    res.status(200).json(departmentsWithStaffCount);
  } catch (error) {
    console.error('Error fetching all departments with aggregated data:', error.stack);
    res.status(500).json({ message: 'Server error when fetching departments.' });
  }
};

// --- Get department by ID with aggregated data ---
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT
          d.id,
          d.name,
          d.description,
          d.created_at,
          d.updated_at,
          d.head_of_department_id,
          COALESCE(h.first_name || ' ' || h.last_name, 'N/A') AS head_of_department_name, -- Concatenate first_name and last_name
          COUNT(DISTINCT CASE WHEN u_doc.role = 'doctor' AND a.department_id = d.id THEN u_doc.id ELSE NULL END) AS doctor_count,
          COUNT(DISTINCT CASE WHEN a.appointment_date = CURRENT_DATE THEN a.patient_id ELSE NULL END) AS patients_today,
          COUNT(DISTINCT CASE WHEN a.appointment_date >= CURRENT_DATE THEN a.id ELSE NULL END) AS scheduled_appointments
      FROM
          departments d
      LEFT JOIN
          users h ON d.head_of_department_id = h.id
      LEFT JOIN
          appointments a ON a.department_id = d.id
      LEFT JOIN
          users u_doc ON a.doctor_id = u_doc.id AND u_doc.role = 'doctor'
      WHERE
          d.id = $1
      GROUP BY
          d.id, h.first_name, h.last_name; -- Group by first_name and last_name
    `;
    const department = await pool.query(query, [id]);

    if (department.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    // Rename 'doctor_count' to 'staff_count' for frontend consistency
    const departmentData = {
      ...department.rows[0],
      staff_count: department.rows[0].doctor_count
    };
    res.status(200).json(departmentData);
  } catch (error) {
    console.error('Error fetching department by ID with aggregated data:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid department ID format.' });
    }
    res.status(500).json({ message: 'Server error when fetching department by ID.' });
  }
};

// --- Update department ---
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description, head_of_department_id } = req.body;

  try {
    // Check if a new name is provided and if it already exists for another department
    if (name) {
      const existingDepartment = await pool.query(
        'SELECT id FROM departments WHERE name = $1 AND id <> $2',
        [name, id]
      );
      if (existingDepartment.rows.length > 0) {
        return res.status(409).json({ message: 'Another department with this name already exists.' });
      }
    }

    const updatedDepartment = await pool.query(
      `UPDATE departments
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           head_of_department_id = COALESCE($3, head_of_department_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, head_of_department_id, id]
    );

    if (updatedDepartment.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    res.status(200).json({
      message: 'Department updated successfully.',
      department: updatedDepartment.rows[0]
    });
  } catch (error) {
    console.error('Error updating department:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid data format provided.' });
    } else if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'A department with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error when updating department.' });
  }
};

// --- Delete department ---
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.status(200).json({ message: 'Department deleted successfully.', id: deleteResponse.rows[0].id });
  } catch (error) {
    console.error('Error deleting department:', error.stack);
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({ message: 'Cannot delete department due to associated records (e.g., doctors, patients linked to this department). Remove associations first.' });
    }
    res.status(500).json({ message: 'Server error when deleting department.' });
  }
};

// --- Get staff (doctors) by department ID ---
exports.getStaffByDepartment = async (req, res) => {
  const { id } = req.params; // department ID

  try {
    // Fetch doctors associated with this department via appointments
    const doctors = await pool.query(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.role
       FROM users u
       JOIN appointments a ON u.id = a.doctor_id
       WHERE a.department_id = $1 AND u.role = 'doctor'
       ORDER BY u.first_name ASC`,
      [id]
    );

    // Map to 'name' and 'role' for frontend consistency
    const staffList = doctors.rows.map(doc => ({
      id: doc.id,
      name: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
      role: doc.role
    }));

    res.status(200).json(staffList);
  } catch (error) {
    console.error('Error fetching staff (doctors) by department:', error.stack);
    res.status(500).json({ message: 'Server error when fetching staff for department.' });
  }
};

// --- Get potential department heads (e.g., doctors or admins) ---
exports.getPotentialDepartmentHeads = async (req, res) => {
  try {
    // Assuming 'users' table has 'id', 'first_name', 'last_name', and 'role'
    // and roles 'doctor' or 'admin' can be department heads
    const heads = await pool.query(
      `SELECT id, first_name, last_name
       FROM users
       WHERE role IN ('doctor', 'admin')
       ORDER BY first_name ASC, last_name ASC`
    );

    // Combine first_name and last_name into a single 'name' field for frontend
    const formattedHeads = heads.rows.map(head => ({
      id: head.id,
      name: `${head.first_name || ''} ${head.last_name || ''}`.trim()
    }));

    res.status(200).json(formattedHeads);
  } catch (error) {
    console.error('Error fetching potential department heads:', error.stack);
    res.status(500).json({ message: 'Server error when fetching potential department heads.' });
  }
};