const mongoose = require('mongoose');
const cabSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  driverName: {
    type: String,
    required: true,
  },
  driverPhoneNumber: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10
  },
  available: {
    type: Boolean,
    default: true
  },
  cabType: {
    type: String,
    required: true
  }
});

const Cab = mongoose.model('cab', cabSchema);
module.exports = Cab;