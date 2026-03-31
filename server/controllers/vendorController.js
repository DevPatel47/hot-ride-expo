const Vendor = require('../models/Vendor');
const EventVendor = require('../models/EventVendor');

exports.getAll = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('userID', 'name email').sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, contactEmail, phone } = req.body;
    if (!name || !contactEmail || !phone) return res.status(400).json({ message: 'All fields are required' });
    const vendor = await Vendor.create({ name, contactEmail, phone, userID: req.user.id });
    res.status(201).json(vendor);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getEventVendors = async (req, res) => {
  try {
    const filter = req.query.eventID ? { eventID: req.query.eventID } : {};
    const eventVendors = await EventVendor.find(filter)
      .populate('vendorID', 'name contactEmail phone')
      .populate('eventID', 'eventName date');
    res.json(eventVendors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyBooths = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userID: req.user.id });
    if (!vendor) return res.json({ vendor: null, booths: [] });

    const booths = await EventVendor.find({ vendorID: vendor._id })
      .populate('vendorID', 'name contactEmail phone')
      .populate('eventID', 'eventName date location status');

    res.json({ vendor, booths });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEventVendor = async (req, res) => {
  try {
    let { eventID, vendorID, boothNumber, amountPaid } = req.body;

    // If vendor role, auto-resolve their vendorID
    if (req.user.role === 'vendor' && !vendorID) {
      const vendor = await Vendor.findOne({ userID: req.user.id });
      if (!vendor) return res.status(400).json({ message: 'Vendor profile not found' });
      vendorID = vendor._id;
    }

    if (!eventID || !vendorID || !boothNumber || !amountPaid) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const ev = await EventVendor.create({ eventID, vendorID, boothNumber, amountPaid });
    const populated = await EventVendor.findById(ev._id)
      .populate('vendorID', 'name contactEmail phone')
      .populate('eventID', 'eventName date');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
