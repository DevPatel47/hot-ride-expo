const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  charityName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
