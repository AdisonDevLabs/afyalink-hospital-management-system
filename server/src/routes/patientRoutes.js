const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.post('/', conditionallyProtect, authorize('admin', 'receptionist'), patientController.createPatient);

router.get('/', conditionallyProtect, authorize('admin', 'receptionist', 'nurse', 'doctor', 'guest_demo'), patientController.getAllPatients);

router.get('/count', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), patientController.getPatientCount);

router.get('/recent', conditionallyProtect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest_demo'), patientController.getRecentPatients);

router.get('/:id', conditionallyProtect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest_demo'), patientController.getPatientById);

router.put('/:id', conditionallyProtect, authorize('admin', 'receptionist'), patientController.updatePatient);

router.delete('/:id', conditionallyProtect, authorize('admin'), patientController.deletePatient);

module.exports = router;