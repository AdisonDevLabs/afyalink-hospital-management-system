// frontend/src/pages/ClinicalNotesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
  const borderColor = type === 'success' ? 'border-green-400 dark:border-green-700' : 'border-red-400 dark:border-red-700';
  const textColor = type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';
  const iconColor = type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg dark:shadow-xl flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4 transform transition-all duration-300 ease-out transition-colors`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconColor} transition-colors duration-300`}>
        {type === 'success' ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
        )}
      </div>
      <span className="font-medium flex-grow">{message}</span>
      <button onClick={onClose} className={`ml-auto ${iconColor} hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-md p-1 transition-colors duration-300`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

// --- Simple Modal Component ---
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-lg w-full max-w-2xl transform transition-all sm:my-8 sm:align-middle sm:w-full animate-scale-up transition-colors duration-300"> {/* Dark mode background and shadow */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-300"> {/* Dark mode border and background */}
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">{title}</h3> {/* Dark mode text */}
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-md p-1 transition-colors duration-300" // Dark mode text, hover, and ring
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//${backendUrl}/api/v1

function ClinicalNotesPage() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { patientId: patientIdFromUrl } = useParams();

  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromUrl || '');
  const [patient, setPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]); // New state for appointments
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });

  // State to manage expanded notes
  const [expandedNotes, setExpandedNotes] = useState({});
  // New state for search term
  const [searchTerm, setSearchTerm] = useState('');

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };


  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  }, []);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    visit_datetime: '',
    chief_complaint: '', // Now serves as 'Subjective'
    diagnosis: '',       // Now serves as 'Assessment'
    medications_prescribed: '',
    vitals: '',          // Now serves as 'Objective'
    notes: '',           // Now serves as 'Plan'
    note_type: 'Consultation',
    appointment_id: '', // New field for appointment ID
  });

  // Effect to pre-fill form date/time when modal is opened for new note
  useEffect(() => {
    if (showNoteModal && !editingNote) { // Only for adding new note
      resetFormData();
    }
  }, [showNoteModal, editingNote]);

  // Fetch patients for dropdown
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchPatients = async () => {
      try {
        const patientsRes = await fetch(`${backendUrl}/api/v1/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!patientsRes.ok) throw new Error('Failed to fetch patients.');
        const patientsData = await patientsRes.json();
        setPatientsList(Array.isArray(patientsData.patients) ? patientsData.patients : []);
      } catch (err) {
        console.error('Error fetching patients for dropdown:', err);
        showNotification(err.message || 'Failed to load patient list.', 'error');
      } finally {
        if (!patientIdFromUrl) {
            setPageLoading(false);
        }
      }
    };
    fetchPatients();
  }, [isAuthenticated, token, authLoading, navigate, showNotification, patientIdFromUrl]);

  useEffect(() => {
    if (!token || !selectedPatientId) {
      setPatient(null);
      setClinicalNotes([]);
      if (!patientIdFromUrl || !selectedPatientId) {
         setPageLoading(false);
      }
      return;
    }

    const fetchPatientAndNotes = async () => {
      setPageLoading(true);
      setNotification({ message: null, type: null });
      try {
        // Fetch patient details
        const patientRes = await fetch(`${backendUrl}/api/v1/patients/${selectedPatientId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!patientRes.ok) {
          const errorData = await patientRes.json();
          throw new Error(errorData.message || 'Patient not found.');
        }
        const patientData = await patientRes.json();
        setPatient(patientData.patient); // Access the 'patient' key

        // Fetch clinical notes for the selected patient
        const notesRes = await fetch(`${backendUrl}/api/v1/clinical-notes/patient/${selectedPatientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!notesRes.ok) {
          const errorData = await notesRes.json();
          throw new Error(errorData.message || 'Failed to fetch clinical notes.');
        }
        const notesData = await notesRes.json();
        setClinicalNotes(notesData);

      } catch (err) {
        console.error('Error fetching patient details or notes:', err);
        showNotification(err.message || 'Failed to load patient data or clinical notes.', 'error');
        setPatient(null);
        setClinicalNotes([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPatientAndNotes();
  }, [token, selectedPatientId, showNotification, patientIdFromUrl]);

  // New Effect to fetch appointments when the modal is opened and a patient is selected
  useEffect(() => {
    const fetchAppointments = async () => {
      if (showNoteModal && selectedPatientId && token) {
        try {
          // Changed the API endpoint to use a query parameter for patient_id
          const response = await fetch(`${backendUrl}/api/v1/appointments?patient_id=${selectedPatientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch patient appointments.');
          }
          const data = await response.json();
          setAppointmentsList(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          showNotification(error.message || 'Failed to load appointments for the patient.', 'error');
          setAppointmentsList([]);
        }
      } else {
        setAppointmentsList([]); // Clear appointments when modal is closed or no patient selected
      }
    };

    fetchAppointments();
  }, [showNoteModal, selectedPatientId, token, showNotification]); // Rerun when modal state or patient changes

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Convert empty string for appointment_id to null
    if (name === 'appointment_id' && value === '') {
        value = null;
    }
    setFormData({ ...formData, [name]: value });
  };

  const resetFormData = () => {
    const now = new Date();
    // Adjust for local timezone to ensure `datetime-local` input displays correctly
    const formattedDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

    setFormData({
      visit_datetime: formattedDateTime,
      chief_complaint: '', // Subjective
      diagnosis: '',       // Assessment
      medications_prescribed: '',
      vitals: '',          // Objective
      notes: '',           // Plan
      note_type: 'Consultation',
      appointment_id: '', // Reset appointment ID
    });
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    // Updated validation to reflect SOAP fields
    if (!formData.visit_datetime || !formData.note_type || !formData.chief_complaint || !formData.notes) {
      showNotification('Visit Date/Time, Note Type, Subjective, and Plan sections are required.', 'error');
      return;
    }

    try {
      const payload = {
        patient_id: parseInt(selectedPatientId),
        visit_datetime: formData.visit_datetime,
        chief_complaint: formData.chief_complaint, // Subjective
        diagnosis: formData.diagnosis,             // Assessment
        medications_prescribed: formData.medications_prescribed,
        vitals: formData.vitals,                  // Objective
        notes: formData.notes,                     // Plan
        note_type: formData.note_type,
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null, // Send null if empty string
      };

      const url = editingNote
        ? `${backendUrl}/api/v1/clinical-notes/${editingNote.id}`
        : `${backendUrl}/api/v1/clinical-notes`;
      const method = editingNote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${editingNote ? 'update' : 'add'} clinical note.`);
      }

      // Re-fetch notes after successful operation
      const updatedNotesRes = await fetch(`${backendUrl}/api/v1/clinical-notes/patient/${selectedPatientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!updatedNotesRes.ok) {
        showNotification(`Note ${editingNote ? 'updated' : 'added'} successfully, but failed to refresh notes.`, 'warning');
        console.error("Failed to re-fetch clinical notes after successful operation:", updatedNotesRes);
      } else {
        const updatedNotesData = await updatedNotesRes.json();
        setClinicalNotes(updatedNotesData);
        showNotification(`Clinical note ${editingNote ? 'updated' : 'added'} successfully!`, 'success');
      }
      setShowNoteModal(false);
      setEditingNote(null);
      resetFormData();
    } catch (err) {
      console.error(`Error ${editingNote ? 'updating' : 'adding'} clinical note:`, err);
      showNotification(err.message || `An error occurred while ${editingNote ? 'updating' : 'adding'} the note.`, 'error');
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    // Ensure date format is compatible with datetime-local input
    const visitDateTime = note.visit_datetime ? new Date(note.visit_datetime) : new Date();
    const formattedDateTime = new Date(visitDateTime.getTime() - (visitDateTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setFormData({
      visit_datetime: formattedDateTime,
      chief_complaint: note.chief_complaint || '', // Subjective
      diagnosis: note.diagnosis || '',             // Assessment
      medications_prescribed: note.medications_prescribed || '',
      vitals: note.vitals || '',                  // Objective
      notes: note.notes || '',                     // Plan
      note_type: note.note_type || 'Consultation',
      appointment_id: note.appointment_id || '', // Populate appointment ID
    });
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this clinical note? This action cannot be undone.')) {
      return;
    }
    setPageLoading(true);
    setNotification({ message: null, type: null });
    try {
      const response = await fetch(`${backendUrl}/api/v1/clinical-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete clinical note.');
      }
      setClinicalNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      showNotification('Clinical note deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting clinical note:', err);
      showNotification(err.message || 'An error occurred while deleting the note.', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return original if formatting fails
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (authLoading || pageLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 transition-colors duration-300'> {/* Dark mode background and text */}
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className='text-xl'>Loading clinical notes page...</div>
      </div>
    );
  }

  // --- Role-Based Access Control Logic (Frontend) ---
  const userRole = user?.role;
  const currentUserId = user?.id;

  const canAddNote = ['admin', 'doctor', 'nurse'].includes(userRole);

  const canEditSpecificNote = (note) => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor' && note.doctor_id === currentUserId) return true;
    if (userRole === 'nurse' && note.note_type === 'Progress Note' && note.doctor_id === currentUserId) return true; // Nurses can edit their own progress notes
    return false;
  };

  const canDeleteSpecificNote = (note) => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor' && note.doctor_id === currentUserId) return true;
    // Potentially allow nurses to delete their own progress notes if business logic allows
    // if (userRole === 'nurse' && note.note_type === 'Progress Note' && note.doctor_id === currentUserId) return true;
    return false;
  };

  // Note: 'Receptionist' would have no access to Add/Edit/Delete buttons.
  // Their view would be limited to selecting patients and viewing existing notes.
  // The backend MUST enforce these rules as well.

  // Filtered list of patients based on search term
  const filteredPatients = patientsList.filter(p =>
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: null, type: null })} />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg transition-colors duration-300">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0 transition-colors duration-300">Clinical Notes</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search Input Field */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out"
            />
          </div>

          <label htmlFor="patient-select" className="sr-only">Select Patient</label>
          <div className="relative w-full sm:w-auto">
            <select
              id="patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full sm:w-auto px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 transition duration-200 ease-in-out bg-white dark:bg-gray-700 appearance-none pr-10 cursor-pointer transition-colors"
              aria-label="Select Patient"
            >
              <option value="">-- Select a Patient --</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (ID: {p.id})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>

          {canAddNote && ( // Only show if user can add notes
            <button
              onClick={() => {
                if (!selectedPatientId) {
                  showNotification('Please select a patient first to add a clinical note.', 'error');
                  return;
                }
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105 whitespace-nowrap w-full sm:w-auto transition-colors"
            >
              <svg className="inline-block h-5 w-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Note
            </button>
          )}
        </div>
      </header>

      {selectedPatientId && patient && (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 mb-8 border-l-4 border-blue-500 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center transition-colors duration-300">
            <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Patient: {patient.first_name} {patient.last_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
            <p><strong>Date of Birth:</strong> {formatDate(patient.date_of_birth)}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Contact:</strong> {patient.contact_phone}</p>
            <p className="md:col-span-2 lg:col-span-3"><strong>Address:</strong> {patient.address}</p>
          </div>
        </section>
      )}

      {selectedPatientId && !patient && !pageLoading && (
        <div className="text-center bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 p-6 rounded-md shadow-md dark:shadow-lg animate-fade-in transition-colors duration-300">
          <svg className="mx-auto h-12 w-12 text-yellow-400 dark:text-yellow-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">Patient Not Found</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400 transition-colors duration-300">The selected patient could not be loaded or does not exist.</p>
        </div>
      )}

      {selectedPatientId && patient && clinicalNotes.length > 0 && (
        <section className="grid grid-cols-1 gap-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-300">Clinical Notes History</h2>
          {clinicalNotes.sort((a, b) => new Date(b.visit_datetime) - new Date(a.visit_datetime)).map(note => (
            <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl p-6 border-t-4 border-green-500 hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">Visit Date: {formatDate(note.visit_datetime)}</h3>
                  {note.created_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Created: {formatDate(note.created_at)}</p>
                  )}
                  {note.updated_at && note.updated_at !== note.created_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Last Updated: {formatDate(note.updated_at)}</p>
                  )}
                  {note.note_type && (
                    <p className="text-md text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300"><strong>Note Type:</strong> {note.note_type}</p>
                  )}
                  {note.appointment_id && (
                    <p className="text-md text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                      <strong>Linked Appointment:</strong>{' '}
                      {formatDate(note.appointment_date)} at {note.appointment_time} - {note.appointment_reason} ({note.appointment_status})
                    </p>
                  )}
                </div>
                {/* Conditionally render Edit/Delete buttons based on specific note permissions */}
                <div className="flex space-x-2">
                  {canEditSpecificNote(note) && (
                    <button
                      onClick={() => handleEditClick(note)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transition-colors"
                      title="Edit Note"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Edit
                    </button>
                  )}
                  {canDeleteSpecificNote(note) && (
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out transition-colors"
                      title="Delete Note"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              {/* Displaying notes in SOAP format */}
              <div className="space-y-4 text-gray-700 dark:text-gray-200 transition-colors duration-300">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md border border-blue-200 dark:border-blue-700 shadow-inner dark:shadow-md transition-colors duration-300">
                  <p className="font-semibold text-blue-800 dark:text-blue-100 mb-1 transition-colors duration-300">Subjective:</p>
                  <p>
                    {expandedNotes[note.id] || (note.chief_complaint && note.chief_complaint.length < 250) ? note.chief_complaint : truncateText(note.chief_complaint, 250)}
                    {note.chief_complaint && note.chief_complaint.length >= 250 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 dark:text-blue-400 hover:underline ml-2 text-sm focus:outline-none transition-colors duration-300">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                </div>

                {note.vitals && (
                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md border border-green-200 dark:border-green-700 shadow-inner dark:shadow-md transition-colors duration-300">
                    <p className="font-semibold text-green-800 dark:text-green-100 mb-1 transition-colors duration-300">Objective:</p>
                    <p>
                      {expandedNotes[note.id] || (note.vitals && note.vitals.length < 250) ? note.vitals : truncateText(note.vitals, 250)}
                      {note.vitals && note.vitals.length >= 250 && (
                        <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 dark:text-blue-400 hover:underline ml-2 text-sm focus:outline-none transition-colors duration-300">
                          {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  </div>
                )}
                
                {note.diagnosis && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md border border-yellow-200 dark:border-yellow-700 shadow-inner dark:shadow-md transition-colors duration-300">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-100 mb-1 transition-colors duration-300">Assessment:</p>
                    <p>
                      {expandedNotes[note.id] || (note.diagnosis && note.diagnosis.length < 250) ? note.diagnosis : truncateText(note.diagnosis, 250)}
                      {note.diagnosis && note.diagnosis.length >= 250 && (
                        <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 dark:text-blue-400 hover:underline ml-2 text-sm focus:outline-none transition-colors duration-300">
                          {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  </div>
                )}

                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md border border-red-200 dark:border-red-700 shadow-inner dark:shadow-md transition-colors duration-300">
                  <p className="font-semibold text-red-800 dark:text-red-100 mb-1 transition-colors duration-300">Plan:</p>
                  {note.medications_prescribed && (
                    <p className="mb-2">
                      <strong>Medications:</strong>{' '}
                      {expandedNotes[note.id] || (note.medications_prescribed && note.medications_prescribed.length < 150) ? note.medications_prescribed : truncateText(note.medications_prescribed, 150)}
                      {note.medications_prescribed && note.medications_prescribed.length >= 150 && (
                        <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 dark:text-blue-400 hover:underline ml-2 text-sm focus:outline-none transition-colors duration-300">
                          {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  )}
                  <p>
                    <strong>Details:</strong>{' '}
                    {expandedNotes[note.id] || (note.notes && note.notes.length < 250) ? note.notes : truncateText(note.notes, 250)}
                    {note.notes && note.notes.length >= 250 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 dark:text-blue-400 hover:underline ml-2 text-sm focus:outline-none transition-colors duration-300">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedPatientId && patient && clinicalNotes.length === 0 && !pageLoading && (
        <div className="text-center bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-700 text-blue-700 dark:text-blue-200 p-6 rounded-md shadow-md dark:shadow-lg animate-fade-in transition-colors duration-300">
          <svg className="mx-auto h-12 w-12 text-blue-400 dark:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">No Clinical Notes Found</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400 transition-colors duration-300">There are no clinical notes for {patient.first_name} {patient.last_name} yet.</p>
          {canAddNote && ( // Only show if user can add notes
            <button
              onClick={() => {
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md dark:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 transition-colors"
            >
              <svg className="inline-block h-5 w-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add the First Note
            </button>
          )}
        </div>
      )}

      {!selectedPatientId && !pageLoading && (
        <div className="text-center bg-gray-50 dark:bg-gray-700 border-l-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-6 rounded-md shadow-md dark:shadow-lg animate-fade-in transition-colors duration-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">Select a Patient to Begin</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400 transition-colors duration-300">Please choose a patient from the dropdown menu above to view or add clinical notes.</p>
        </div>
      )}

      <Modal
        isOpen={showNoteModal}
        onClose={() => { setShowNoteModal(false); setEditingNote(null); resetFormData(); setNotification({ message: null, type: null }); }}
        title={editingNote ? 'Edit Clinical Note' : 'Add New Clinical Note'}
      >
        <form onSubmit={handleAddEditSubmit} className="space-y-6">
          {/* Section: Visit Details */}
          <fieldset className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm dark:shadow-md transition-colors duration-300">
            <legend className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-2 transition-colors duration-300">Visit Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor='visit_datetime' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Visit Date & Time: <span className="text-red-500">*</span></label>
                <input
                  type='datetime-local'
                  id='visit_datetime'
                  name='visit_datetime'
                  value={formData.visit_datetime}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                />
              </div>
              <div>
                <label htmlFor='note_type' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Note Type: <span className="text-red-500">*</span></label>
                <select
                  id='note_type'
                  name='note_type'
                  value={formData.note_type}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Progress Note">Progress Note</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  {/* Add more types as needed */}
                </select>
              </div>
              {/* New field for Appointment Selection */}
              <div>
                <label htmlFor='appointment_id' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Link to Appointment:</label>
                <select
                  id='appointment_id'
                  name='appointment_id'
                  value={formData.appointment_id || ''} // Use empty string for null/undefined to display the "None" option
                  onChange={handleInputChange}
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                >
                  <option value="">-- None --</option>
                  {appointmentsList.length > 0 ? (
                    appointmentsList.map(appt => (
                      <option key={appt.id} value={appt.id}>
                        {formatDate(appt.appointment_date)} at {appt.appointment_time} - {appt.reason} ({appt.status})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No appointments available for this patient</option>
                  )}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Section: SOAP Notes */}
          <fieldset className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm dark:shadow-md transition-colors duration-300">
            <legend className="text-lg font-semibold text-gray-800 dark:text-gray-100 px-2 transition-colors duration-300">SOAP Note Details</legend>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label htmlFor='chief_complaint' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Subjective: (Chief Complaint & Patient Report) <span className="text-red-500">*</span></label>
                <textarea
                  id='chief_complaint'
                  name='chief_complaint'
                  value={formData.chief_complaint}
                  onChange={handleInputChange}
                  rows='4'
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                ></textarea>
              </div>
              <div>
                <label htmlFor='vitals' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Objective: (Exam Findings & Vitals)</label>
                <textarea
                  id='vitals'
                  name='vitals'
                  value={formData.vitals}
                  onChange={handleInputChange}
                  rows='4'
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                ></textarea>
              </div>
              <div>
                <label htmlFor='diagnosis' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Assessment: (Diagnosis)</label>
                <textarea
                  id='diagnosis'
                  name='diagnosis'
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows='4'
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                ></textarea>
              </div>
              <div>
                <label htmlFor='notes' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Plan: (Treatment, Meds, Follow-up) <span className="text-red-500">*</span></label>
                <textarea
                  id='notes'
                  name='notes'
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows='8'
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                ></textarea>
              </div>
              <div>
                <label htmlFor='medications_prescribed' className='block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1 transition-colors duration-300'>Medications Prescribed: (Part of Plan)</label>
                <textarea
                  id='medications_prescribed'
                  name='medications_prescribed'
                  value={formData.medications_prescribed}
                  onChange={handleInputChange}
                  rows='3'
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 dark:bg-gray-700 transition duration-200 ease-in-out transition-colors'
                ></textarea>
              </div>
            </div>
          </fieldset>

          <div className='flex justify-end items-center gap-4 mt-6'>
            <button
              type='button'
              onClick={() => { setShowNoteModal(false); setEditingNote(null); resetFormData(); setNotification({ message: null, type: null }); }}
              className='bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-2.5 px-6 rounded-lg shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition duration-300 ease-in-out transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition duration-300 ease-in-out transition-colors'
            >
              {editingNote ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClinicalNotesPage;