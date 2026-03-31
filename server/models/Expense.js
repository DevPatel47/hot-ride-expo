const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  expenseDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
