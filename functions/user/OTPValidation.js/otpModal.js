const mongoose = require('mongoose');

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP documents expire after 10 minutes (600 seconds)
  }
});

// Create OTP model
const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
