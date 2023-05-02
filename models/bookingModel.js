const mongoose = require('mongoose');
const User = require('../models/userModel');
const Cab = require('../models/cabModel');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        autopopulate: true,
        required: true,
    },
    cab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Cab,
        autopopulate: true,
        required: true
    },
    pickUpLocation: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    dropOffLocation: {
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    bookingDate: {
        type: Date,
        default: Date()
    },
    distance: {
        type: String
    },
    rideCharges: {
        type: String,
    },
    pickupTime: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'booked'
    }

});
bookingSchema.plugin(require('mongoose-autopopulate'));
const Booking = mongoose.model('booking', bookingSchema);
module.exports = Booking;