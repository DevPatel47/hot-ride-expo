const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, default: '' },
  registrationFee: { type: Number, default: 75 },
  organizerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charityID: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  status: { type: String, required: true, enum: ['Open', 'Closed', 'Cancelled'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
