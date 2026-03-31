const mongoose = require('mongoose');

const eventSponsorSchema = new mongoose.Schema({
  sponsorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  packageID: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorPackage', required: true },
  amountPaid: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('EventSponsor', eventSponsorSchema);
