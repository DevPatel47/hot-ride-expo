const Sponsor = require('../models/Sponsor');
const SponsorPackage = require('../models/SponsorPackage');
const EventSponsor = require('../models/EventSponsor');

// --- Sponsors ---
exports.getAll = async (req, res) => {
  try {
    const sponsors = await Sponsor.find().populate('userID', 'name email').sort({ createdAt: -1 });
    res.json(sponsors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, contactEmail, phone } = req.body;
    if (!name || !contactEmail || !phone) return res.status(400).json({ message: 'All fields are required' });
    const sponsor = await Sponsor.create({ name, contactEmail, phone, userID: req.user.id });
    res.status(201).json(sponsor);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Packages ---
exports.getPackages = async (req, res) => {
  try {
    const filter = req.query.eventID ? { eventID: req.query.eventID } : {};
    const packages = await SponsorPackage.find(filter).populate('eventID', 'eventName date');
    res.json(packages);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createPackage = async (req, res) => {
  try {
    const { eventID, packageName, description, basePrice } = req.body;
    if (!eventID || !packageName || !basePrice) return res.status(400).json({ message: 'eventID, packageName, and basePrice are required' });
    const pkg = await SponsorPackage.create({ eventID, packageName, description, basePrice });
    res.status(201).json(pkg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Event Sponsors ---
exports.getEventSponsors = async (req, res) => {
  try {
    const eventSponsors = await EventSponsor.find()
      .populate('sponsorID', 'name contactEmail phone')
      .populate({ path: 'packageID', populate: { path: 'eventID', select: 'eventName' } });
    res.json(eventSponsors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMySponsorships = async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ userID: req.user.id });
    if (!sponsor) return res.json({ sponsor: null, sponsorships: [], packages: [] });

    const sponsorships = await EventSponsor.find({ sponsorID: sponsor._id })
      .populate('sponsorID', 'name contactEmail phone')
      .populate({ path: 'packageID', populate: { path: 'eventID', select: 'eventName date location' } });

    const packages = await SponsorPackage.find().populate('eventID', 'eventName date location status');

    res.json({ sponsor, sponsorships, packages });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEventSponsor = async (req, res) => {
  try {
    let { sponsorID, packageID, amountPaid } = req.body;
    
    // If sponsor role, auto-resolve their sponsorID
    if (req.user.role === 'sponsor' && !sponsorID) {
      const sponsor = await Sponsor.findOne({ userID: req.user.id });
      if (!sponsor) return res.status(400).json({ message: 'Sponsor profile not found' });
      sponsorID = sponsor._id;
    }

    if (!sponsorID || !packageID || !amountPaid) return res.status(400).json({ message: 'All fields are required' });
    const es = await EventSponsor.create({ sponsorID, packageID, amountPaid });
    const populated = await EventSponsor.findById(es._id)
      .populate('sponsorID', 'name contactEmail phone')
      .populate({ path: 'packageID', populate: { path: 'eventID', select: 'eventName' } });
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
