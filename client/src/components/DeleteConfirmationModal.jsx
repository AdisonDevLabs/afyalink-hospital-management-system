// client/src/components/DeleteConfirmModal.jsx

import React from "react";
import { motion } from 'framer-motion';
import Modal from './Modal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, patientName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="text-center p-5">
        <svg className="mx-auto mb-4 h-16 w-16 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        <h3 className="mb-5 text-lg font-normal text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the record for <span className="font-semibold">{patientName}</span>?
          This action cannot be undone.
        </h3>
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            Yes, I'm sure
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            No, Cancel
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;