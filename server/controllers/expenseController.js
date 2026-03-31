const Expense = require('../models/Expense');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.eventID ? { eventID: req.query.eventID } : {};
    const expenses = await Expense.find(filter).populate('eventID', 'eventName date').sort({ expenseDate: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { eventID, description, amount, expenseDate } = req.body;
    if (!eventID || !description || !amount || !expenseDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const expense = await Expense.create({ eventID, description, amount, expenseDate });
    const populated = await Expense.findById(expense._id).populate('eventID', 'eventName date');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const e = await Expense.findByIdAndDelete(req.params.id);
    if (!e) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
