// frontend/src/pages/DepartmentsManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable Notification Component (already concise)
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = isSuccess ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = isSuccess ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${bgColor} ${borderColor} ${textColor} border-l-4 dark:shadow-xl`}
      role="alert"
    >
      {isSuccess ? (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      )}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className={`ml-auto ${textColor} hover:opacity-75 dark:text-gray-300`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// Reusable Modal Component (already concise)
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-none p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-3">{title}</h2>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-400 text-3xl leading-none">
              &times;
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Delete Confirmation Modal (already concise)
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, departmentName }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Are you sure you want to delete department <span className="font-semibold">{departmentName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300">
          Cancel
        </button>
        <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300">
          Delete
        </button>
      </div>
    </Modal>
  );
};

// Staff List Modal (already concise)
const StaffListModal = ({ isOpen, onClose, departmentName, staffList }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Staff in ${departmentName}`}>
      {staffList?.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          {staffList.map((staff, idx) => (
            <li key={idx}>{staff.name} ({staff.role})</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">No staff currently assigned to this department.</p>
      )}
    </Modal>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function DepartmentsManagementPage() {
  const { user, token, getApiPrefix } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [showDepartmentFormModal, setShowDepartmentFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [showStaffListModal, setShowStaffListModal] = useState(false);
  const [currentDepartmentStaff, setCurrentDepartmentStaff] = useState([]);
  const [currentDepartmentNameForStaff, setCurrentDepartmentNameForStaff] = useState('');
  const [potentialDepartmentHeads, setPotentialDepartmentHeads] = useState([]);

  const initialFormData = { name: '', description: '', head_of_department_id: '' };
  const [formData, setFormData] = useState(initialFormData);

  const resetFormData = () => setFormData(initialFormData);
  const handleNotificationClose = () => setNotification({ message: null, type: null });
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const fetchStaffForDepartment = useCallback(async (departmentId) => {
    try {
      const res = await fetch(`${backendUrl}${getApiPrefix()}/departments/${departmentId}/staff`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch staff');
      return await res.json();
    } catch (error) {
      console.error('Error fetching staff:', error); // Keep for debugging
      setNotification({ message: 'Failed to load staff for department.', type: 'error' });
      return [];
    }
  }, [token]);

  const fetchPotentialDepartmentHeads = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}${getApiPrefix()}/departments/potential-heads`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch potential department heads');
      setPotentialDepartmentHeads(await res.json());
    } catch (error) {
      console.error('Error fetching potential department heads:', error); // Keep for debugging
      setNotification({ message: 'Failed to load potential department heads.', type: 'error' });
    }
  }, [token]);

  const fetchDepartments = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}${getApiPrefix()}/departments`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 403) {
          setNotification({ message: 'You are not authorized to view departments.', type: 'error' });
          navigate('/dashboard');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setDepartments(await res.json());
    } catch (error) {
      console.error('Error fetching departments:', error); // Keep for debugging
      setNotification({ message: `Failed to fetch departments: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchDepartments();
    fetchPotentialDepartmentHeads();
  }, [fetchDepartments, fetchPotentialDepartmentHeads]);

  const handleAddDepartmentClick = () => {
    setEditingDepartment(null);
    resetFormData();
    handleNotificationClose();
    setShowDepartmentFormModal(true);
  };

  const handleEditDepartmentClick = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      head_of_department_id: department.head_of_department_id || '',
    });
    handleNotificationClose();
    setShowDepartmentFormModal(true);
  };

  const handleSubmitDepartmentForm = async (e) => {
    e.preventDefault();
    handleNotificationClose();

    const payload = { ...formData, head_of_department_id: formData.head_of_department_id || null };
    try {
      const url = editingDepartment ? `${backendUrl}${getApiPrefix()}/departments/${editingDepartment.id}` : `${backendUrl}${getApiPrefix()}/departments`;
      const method = editingDepartment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${editingDepartment ? 'update' : 'add'} department.`);

      setNotification({ message: data.message || `Department ${editingDepartment ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowDepartmentFormModal(false);
      fetchDepartments();
    } catch (error) {
      console.error(`Error ${editingDepartment ? 'updating' : 'adding'} department:`, error); // Keep for debugging
      setNotification({ message: error.message || `An error occurred while ${editingDepartment ? 'updating' : 'adding'} the department.`, type: 'error' });
    }
  };

  const handleDeleteDepartmentClick = (department) => setDepartmentToDelete(department);

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    handleNotificationClose();
    try {
      const res = await fetch(`${backendUrl}${getApiPrefix()}/departments/${departmentToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete department.');

      setNotification({ message: data.message || 'Department deleted successfully!', type: 'success' });
      setDepartmentToDelete(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error); // Keep for debugging
      setNotification({ message: error.message || 'An error occurred while deleting the department.', type: 'error' });
    }
  };

  const handleViewStaffClick = async (department) => {
    setCurrentDepartmentNameForStaff(department.name);
    setCurrentDepartmentStaff(await fetchStaffForDepartment(department.id));
    setShowStaffListModal(true);
  };
{/**
  if (!user || user.role !== 'admin', 'guest_demo') {
    navigate('/dashboard');
    return;
  }*/}

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900'>
        <div className='text-xl text-gray-700 dark:text-gray-300'>Loading departments...</div>
      </div>
    );
  }

  const commonInputClasses = 'w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out';
  const commonButtonClasses = 'font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300';

  return (
    <motion.div
      className='min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8'
      initial='hidden'
      animate='visible'
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
      }}
    >
      <Notification message={notification.message} type={notification.type} onClose={handleNotificationClose} />

      <motion.h1
        className='text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 text-center'
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

      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                {['Name', 'Description', 'Staff Count', 'Patients Today', 'Appointments Today', 'Head of Dept', 'Actions'].map(header => (
                  <th key={header} className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100'>{dept.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis'>{dept.description || 'N/A'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300'>
                      {dept.staff_count}{' '}
                      <button
                        onClick={() => handleViewStaffClick(dept)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                        title="View Staff"
                      >
                        👁️
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300'>{dept.patients_today}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300'>{dept.scheduled_appointments}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300'>{dept.head_of_department_name}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleEditDepartmentClick(dept)}
                        className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3'
                        title='Edit Department'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartmentClick(dept)}
                        className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        title='Delete Department'
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan='7' className='px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400'>
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
        onClose={() => { setShowDepartmentFormModal(false); setEditingDepartment(null); resetFormData(); handleNotificationClose(); }}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmitDepartmentForm} className='grid grid-cols-1 gap-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Department Name</label>
            <input type='text' id='name' name='name' value={formData.name} onChange={handleInputChange} required className={commonInputClasses} />
          </div>
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Description (optional)</label>
            <textarea id='description' name='description' value={formData.description} onChange={handleInputChange} rows='3' className={commonInputClasses} placeholder='Enter a brief description of the department'></textarea>
          </div>

          <div>
            <label htmlFor='head_of_department_id' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Department Head (optional)</label>
            <select id='head_of_department_id' name='head_of_department_id' value={formData.head_of_department_id || ''} onChange={handleInputChange} className={commonInputClasses}>
              <option value=''>-- Select a Department Head --</option>
              {potentialDepartmentHeads.map(head => (
                <option key={head.id} value={head.id}>{head.name}</option>
              ))}
            </select>
          </div>

          <div className='flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => { setShowDepartmentFormModal(false); setEditingDepartment(null); resetFormData(); handleNotificationClose(); }}
              className={`bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 ${commonButtonClasses}`}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={`bg-green-600 hover:bg-green-700 text-white ${commonButtonClasses}`}
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
        departmentName={departmentToDelete?.name || ''}
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