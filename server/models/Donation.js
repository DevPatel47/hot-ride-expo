const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  donorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donorName: { type: String, required: true },
  donorEmail: { type: String, default: '' },
  donationType: { type: String, required: true, enum: ['Cash', 'Item', 'Service', 'Vehicle'] },
  description: { type: String, default: '' },
  estimatedValue: { type: Number, required: true },
  receiptNumber: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
