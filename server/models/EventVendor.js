const mongoose = require('mongoose');

const eventVendorSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  vendorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  boothNumber: { type: String, required: true },
  amountPaid: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('EventVendor', eventVendorSchema);
