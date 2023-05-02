const express = require('express');
const cabController = require('../controllers/cabController');
const authorizeUser = require('../middlewares/auth')

const router = express.Router();

// Get all cabs
router.get('/', authorizeUser, cabController.getAllCabs);

// Add a new cab
router.post('/add', authorizeUser, cabController.addCab);

// Get a specific cab by registration number
router.get('/:registrationNumber', authorizeUser, cabController.getCabByRegistrationNumber);

// Update a specific cab by registration number
router.patch('/:registrationNumber', authorizeUser, cabController.updateCab);

// Delete a specific cab by registration number
router.delete('/:registrationNumber', authorizeUser, cabController.deleteCab);

module.exports = router;
