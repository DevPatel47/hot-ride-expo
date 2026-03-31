const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  tShirtSize: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'], default: 'L' },
  registrationStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
