// frontend/src/pages/DepartmentsManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Notification Component (copied from UsersManagementPage for consistency) ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  // eslint-disable-next-line no-unused-vars
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      )}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className={`ml-auto ${textColor} hover:opacity-75`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// --- Reusable Modal Component (copied from UsersManagementPage for consistency) ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">{title}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl leading-none"
            >
              &times;
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, departmentName }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete department <span className="font-semibold">{departmentName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

// --- Staff List Modal (New Component) ---
const StaffListModal = ({ isOpen, onClose, departmentName, staffList }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Staff in ${departmentName}`}>
      {staffList && staffList.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {staffList.map((staff, index) => (
            <li key={index}>
              {staff.name} ({staff.role})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700">No staff currently assigned to this department.</p>
      )}
    </Modal>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api

// --- Main DepartmentsManagementPage Component ---
function DepartmentsManagementPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [showDepartmentFormModal, setShowDepartmentFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null); // Department object being edited
  const [departmentToDelete, setDepartmentToDelete] = useState(null); // Department object to be deleted
  const [showStaffListModal, setShowStaffListModal] = useState(false); // State for staff list modal
  const [currentDepartmentStaff, setCurrentDepartmentStaff] = useState([]); // Staff for the currently viewed department
  const [currentDepartmentNameForStaff, setCurrentDepartmentNameForStaff] = useState(''); // Name for staff list modal title

  const [potentialDepartmentHeads, setPotentialDepartmentHeads] = useState([]); // Fetched from API

  const initialFormData = {
    name: '',
    description: '',
    head_of_department_id: '', // New field for department head
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const handleNotificationClose = () => {
    setNotification({ message: null, type: null });
  };

  // Helper function to fetch staff for a department
  const fetchStaffForDepartment = async (departmentId) => {
    try {
      const response = await fetch(`${backendUrl}/api/departments/${departmentId}/staff`, { //
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      setNotification({ message: 'Failed to load staff for department.', type: 'error' });
      return [];
    }
  };

  // Helper function to fetch potential department heads
  const fetchPotentialDepartmentHeads = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${backendUrl}/api/departments/potential-heads`, { //
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch potential department heads');
      }
      const data = await response.json();
      setPotentialDepartmentHeads(data);
    } catch (error) {
      console.error('Error fetching potential department heads:', error);
      setNotification({ message: 'Failed to load potential department heads.', type: 'error' });
    }
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/departments`, { //
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          setNotification({ message: 'You are not authorized to view departments.', type: 'error' });
          navigate('/dashboard'); // Redirect if not authorized
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // The backend already provides aggregated data like staff_count, patients_today, scheduled_appointments, and head_of_department_name
      setDepartments(data); //
    } catch (error) {
      console.error('Error fetching departments:', error);
      setNotification({ message: `Failed to fetch departments: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchDepartments();
    fetchPotentialDepartmentHeads(); // Fetch potential heads on component mount
  }, [fetchDepartments, fetchPotentialDepartmentHeads]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartmentClick = () => {
    setEditingDepartment(null);
    resetFormData();
    setNotification({ message: null, type: null });
    setShowDepartmentFormModal(true);
  };

  const handleEditDepartmentClick = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      head_of_department_id: department.head_of_department_id || '', // Populate head if exists
    });
    setNotification({ message: null, type: null });
    setShowDepartmentFormModal(true);
  };

  const handleSubmitDepartmentForm = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    const payload = { ...formData };
    // If head_of_department_id is an empty string, set it to null so the backend handles it correctly
    if (payload.head_of_department_id === '') {
      payload.head_of_department_id = null; //
    }


    try {
      const url = editingDepartment ? `${backendUrl}/api/departments/${editingDepartment.id}` : `${backendUrl}/api/departments`; //
      const method = editingDepartment ? 'PUT' : 'POST'; //

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingDepartment ? 'update' : 'add'} department.`);
      }

      setNotification({ message: data.message || `Department ${editingDepartment ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowDepartmentFormModal(false);
      fetchDepartments(); // Refresh the list ${backendUrl}/api/api
    } catch (error) {
      console.error(`Error ${editingDepartment ? 'updating' : 'adding'} department:`, error);
      setNotification({ message: error.message || `An error occurred while ${editingDepartment ? 'updating' : 'adding'} the department.`, type: 'error' });
    }
  };

  const handleDeleteDepartmentClick = (department) => {
    setDepartmentToDelete(department);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    setNotification({ message: null, type: null });
    try {
      const response = await fetch(`${backendUrl}/api/departments/${departmentToDelete.id}`, { //
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete department.');
      }

      setNotification({ message: data.message || 'Department deleted successfully!', type: 'success' });
      setDepartmentToDelete(null); // Close confirmation modal
      fetchDepartments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting department:', error);
      setNotification({ message: error.message || 'An error occurred while deleting the department.', type: 'error' });
    }
  };

  const handleViewStaffClick = async (department) => {
    setCurrentDepartmentNameForStaff(department.name);
    const staff = await fetchStaffForDepartment(department.id); // Fetch staff for this department
    setCurrentDepartmentStaff(staff);
    setShowStaffListModal(true);
  };

  // Ensure only admin can access this page
  if (!user || user.role !== 'admin') {
    navigate('/dashboard'); // Redirect unauthorized users
    return null;
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading departments...</div>
      </div>
    );
  }

  return (
    <motion.div
      className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'
      initial='hidden'
      animate='visible'
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
      }}
    >
      <Notification message={notification.message} type={notification.type} onClose={handleNotificationClose} />

      <motion.h1
        className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center'
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      >
        Department Management
      </motion.h1>

      <div className='flex justify-end items-center mb-6'>
        <button
          onClick={handleAddDepartmentClick}
          className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out'
        >
          Add New Department
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Description</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Staff Count</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Patients Today</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Appointments Today</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Head of Dept</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='hover:bg-gray-50'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{dept.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis'>{dept.description || 'N/A'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {dept.staff_count}{' '} {/* Use staff_count as returned by backend */}
                      <button
                        onClick={() => handleViewStaffClick(dept)}
                        className="text-blue-500 hover:text-blue-700 ml-1"
                        title="View Staff"
                      >
                        👁️
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{dept.patients_today}</td> {/* Use patients_today as returned by backend */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{dept.scheduled_appointments}</td> {/* Use scheduled_appointments as returned by backend */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{dept.head_of_department_name}</td> {/* Use head_of_department_name as returned by backend */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleEditDepartmentClick(dept)}
                        className='text-blue-600 hover:text-blue-900 mr-3'
                        title='Edit Department'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartmentClick(dept)}
                        className='text-red-600 hover:text-red-900'
                        title='Delete Department'
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan='7' className='px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500'>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Form Modal */}
      <Modal
        isOpen={showDepartmentFormModal}
        onClose={() => { setShowDepartmentFormModal(false); setEditingDepartment(null); resetFormData(); setNotification({ message: null, type: null }); }}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmitDepartmentForm} className='grid grid-cols-1 gap-4'>
          <div className='col-span-1'>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>Department Name</label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              required
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-1'>Description (optional)</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              rows='3'
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
              placeholder='Enter a brief description of the department'
            ></textarea>
          </div>

          {/* Department Head Assignment */}
          <div className='col-span-1'>
            <label htmlFor='head_of_department_id' className='block text-sm font-medium text-gray-700 mb-1'>Department Head (optional)</label>
            <select
              id='head_of_department_id'
              name='head_of_department_id'
              value={formData.head_of_department_id || ''} // Ensure it's an empty string for select
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            >
              <option value=''>-- Select a Department Head --</option>
              {potentialDepartmentHeads.map(head => (
                <option key={head.id} value={head.id}>{head.name}</option>
              ))}
            </select>
          </div>

          <div className='col-span-1 flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => { setShowDepartmentFormModal(false); setEditingDepartment(null); resetFormData(); setNotification({ message: null, type: null }); }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              {editingDepartment ? 'Update Department' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!departmentToDelete}
        onClose={() => setDepartmentToDelete(null)}
        onConfirm={confirmDelete}
        departmentName={departmentToDelete ? departmentToDelete.name : ''}
      />

      <StaffListModal
        isOpen={showStaffListModal}
        onClose={() => setShowStaffListModal(false)}
        departmentName={currentDepartmentNameForStaff}
        staffList={currentDepartmentStaff}
      />
    </motion.div>
  );
}

export default DepartmentsManagementPage;