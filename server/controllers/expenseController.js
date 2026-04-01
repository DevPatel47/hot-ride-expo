const Expense = require('../models/Expense');
const { getOrganizerEventIds, isOrganizer, organizerOwnsEvent } = require('../utils/organizerScope');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventID) {
      filter.eventID = req.query.eventID;
    }
    if (isOrganizer(req.user)) {
      const eventIds = await getOrganizerEventIds(req.user.id);
      filter.eventID = req.query.eventID
        ? { $in: eventIds.filter(id => id.toString() === req.query.eventID) }
        : { $in: eventIds };
    }
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
    if (!(await organizerOwnsEvent(req.user, eventID))) {
      return res.status(403).json({ message: 'You can only record expenses for your own events' });
    }
    const expense = await Expense.create({ eventID, description, amount, expenseDate });
    const populated = await Expense.findById(expense._id).populate('eventID', 'eventName date');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (isOrganizer(req.user)) {
      const eventIds = await getOrganizerEventIds(req.user.id);
      filter.eventID = { $in: eventIds };
    }
    const e = await Expense.findOneAndDelete(filter);
    if (!e) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
