const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  registrationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
  sponsorshipID: { type: mongoose.Schema.Types.ObjectId, ref: 'EventSponsor' },
  vendorBookingID: { type: mongoose.Schema.Types.ObjectId, ref: 'EventVendor' },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentType: { type: String, required: true, enum: ['registration', 'sponsorship', 'vendor_booth', 'donation'], default: 'registration' },
  method: { type: String, required: true, enum: ['Card', 'Cash', 'E-transfer', 'PayPal', 'Interac'] },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  transactionRef: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
