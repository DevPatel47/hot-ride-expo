const Event = require('../models/Event');
const { isOrganizer } = require('../utils/organizerScope');

exports.getAll = async (req, res) => {
  try {
    const filter = isOrganizer(req.user) ? { organizerID: req.user.id } : {};
    const events = await Event.find(filter).populate('organizerID', 'name email').populate('charityID', 'charityName').sort({ date: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const filter = isOrganizer(req.user)
      ? { _id: req.params.id, organizerID: req.user.id }
      : { _id: req.params.id };
    const event = await Event.findOne(filter).populate('organizerID', 'name email').populate('charityID', 'charityName');
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
    if (req.user.role === 'admin' && !organizerID) {
      return res.status(400).json({ message: 'organizerID is required when an admin creates an event' });
    }
    if (registrationFee !== undefined && Number(registrationFee) < 0) {
      return res.status(400).json({ message: 'registrationFee must be zero or greater' });
    }
    const finalOrganizerID = req.user.role === 'organizer' ? req.user.id : (organizerID || req.user.id);
    const event = await Event.create({
      eventName,
      date,
      location,
      description,
      registrationFee: registrationFee === undefined ? undefined : Number(registrationFee),
      organizerID: finalOrganizerID,
      charityID, status
    });
    const populated = await Event.findById(event._id).populate('organizerID', 'name email').populate('charityID', 'charityName');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.user.role === 'organizer') {
      delete updates.organizerID;
    }
    if (updates.registrationFee !== undefined) {
      if (Number(updates.registrationFee) < 0) {
        return res.status(400).json({ message: 'registrationFee must be zero or greater' });
      }
      updates.registrationFee = Number(updates.registrationFee);
    }
    const filter = req.user.role === 'organizer'
      ? { _id: req.params.id, organizerID: req.user.id }
      : { _id: req.params.id };
    const event = await Event.findOneAndUpdate(filter, updates, { new: true, runValidators: true })
      .populate('organizerID', 'name email').populate('charityID', 'charityName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const filter = req.user.role === 'organizer'
      ? { _id: req.params.id, organizerID: req.user.id }
      : { _id: req.params.id };
    const event = await Event.findOneAndDelete(filter);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
