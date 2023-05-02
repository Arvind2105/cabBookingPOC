const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10
  }
}, {versionKey: false});

const User = mongoose.model('user', userSchema);

module.exports = User;
