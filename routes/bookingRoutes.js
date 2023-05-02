const express = require('express');
const bookingController = require('../controllers/bookingController');
const authorizeUser = require('../middlewares/auth')

const router = express.Router();

// Add a new booking
router.post('/', authorizeUser, bookingController.createBooking);

// Get all bookings
router.get('/', authorizeUser, bookingController.getAllBookings);

// Get all bookings of any month.
router.get('/:year/:month', authorizeUser, bookingController.getBookingByMonth);

// Get a specific booking by ID
router.get('/:id', authorizeUser, bookingController.getBookingById);

// Update a specific booking by ID
router.patch('/:id', authorizeUser, bookingController.updateBooking);

// Delete a specific booking by ID
router.delete('/:id', authorizeUser, bookingController.deleteBooking);

module.exports = router;
