const mongoose = require('mongoose');

const registrantSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  club: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Registrant', registrantSchema);
