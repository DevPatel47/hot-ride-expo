const Donation = require('../models/Donation');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.eventID ? { eventID: req.query.eventID } : {};
    const donations = await Donation.find(filter)
      .populate('eventID', 'eventName date')
      .populate('donorID', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorID: req.user.id })
      .populate('eventID', 'eventName date location')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { eventID, donorName, donorEmail, donationType, description, estimatedValue } = req.body;
    if (!eventID || !donorName || !donationType || !estimatedValue) {
      return res.status(400).json({ message: 'eventID, donorName, donationType, and estimatedValue are required' });
    }

    const receiptNumber = 'DON-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const donation = await Donation.create({
      eventID,
      donorID: req.user.role === 'donor' ? req.user.id : undefined,
      donorName,
      donorEmail: donorEmail || req.user.email,
      donationType,
      description,
      estimatedValue,
      receiptNumber
    });
    const populated = await Donation.findById(donation._id).populate('eventID', 'eventName date');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const d = await Donation.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ message: 'Donation not found' });
    res.json({ message: 'Donation deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
