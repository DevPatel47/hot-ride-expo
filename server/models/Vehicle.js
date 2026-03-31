const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrantID: { type: mongoose.Schema.Types.ObjectId, ref: 'Registrant', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
