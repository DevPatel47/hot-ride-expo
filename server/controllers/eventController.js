const Event = require('../models/Event');

exports.getAll = async (req, res) => {
  try {
    const events = await Event.find().populate('organizerID', 'name email').populate('charityID', 'charityName').sort({ date: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerID', 'name email').populate('charityID', 'charityName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { eventName, date, location, description, registrationFee, organizerID, charityID, status } = req.body;
    if (!eventName || !date || !location) {
      return res.status(400).json({ message: 'eventName, date, and location are required' });
    }
    const event = await Event.create({
      eventName, date, location, description, registrationFee,
      organizerID: organizerID || req.user.id,
      charityID, status
    });
    const populated = await Event.findById(event._id).populate('organizerID', 'name email').populate('charityID', 'charityName');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('organizerID', 'name email').populate('charityID', 'charityName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
