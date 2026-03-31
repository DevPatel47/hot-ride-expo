const mongoose = require('mongoose');

const sponsorPackageSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  packageName: { type: String, required: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SponsorPackage', sponsorPackageSchema);
