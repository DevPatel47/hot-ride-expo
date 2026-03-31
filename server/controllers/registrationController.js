const Registration = require('../models/Registration');
const Vehicle = require('../models/Vehicle');
const Registrant = require('../models/Registrant');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.eventID ? { eventID: req.query.eventID } : {};
    const registrations = await Registration.find(filter)
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone club' } })
      .populate('eventID', 'eventName date location status')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id)
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone club' } })
      .populate('eventID', 'eventName date location status');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    // Find registrant linked to current user
    const registrant = await Registrant.findOne({ userID: req.user.id });
    if (!registrant) return res.json([]);

    // Find all vehicles for this registrant
    const vehicles = await Vehicle.find({ registrantID: registrant._id });
    const vehicleIds = vehicles.map(v => v._id);

    // Find all registrations for those vehicles
    const registrations = await Registration.find({ vehicleID: { $in: vehicleIds } })
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone club' } })
      .populate('eventID', 'eventName date location status registrationFee')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { eventID, vehicleID, tShirtSize, registrantName, registrantEmail, registrantPhone, registrantClub, vehicleMake, vehicleModel, vehicleYear } = req.body;

    let finalVehicleID = vehicleID;

    // If creating from registrant flow (no vehicleID provided, but vehicle details given)
    if (!vehicleID && vehicleMake && vehicleModel && vehicleYear) {
      // Find or create registrant
      let registrant;
      if (req.user.role === 'registrant') {
        registrant = await Registrant.findOne({ userID: req.user.id });
        if (!registrant) {
          registrant = await Registrant.create({ userID: req.user.id, name: req.user.name, email: req.user.email, phone: registrantPhone || '', club: registrantClub || '' });
        }
      } else {
        // Staff/admin entering manually
        if (!registrantName || !registrantEmail) return res.status(400).json({ message: 'Registrant details required' });
        registrant = await Registrant.findOne({ email: registrantEmail });
        if (!registrant) {
          registrant = await Registrant.create({ name: registrantName, email: registrantEmail, phone: registrantPhone || '', club: registrantClub || '' });
        }
      }

      // Create vehicle
      const vehicle = await Vehicle.create({ registrantID: registrant._id, make: vehicleMake, model: vehicleModel, year: vehicleYear });
      finalVehicleID = vehicle._id;
    }

    if (!eventID || !finalVehicleID) return res.status(400).json({ message: 'eventID and vehicle details are required' });

    const existing = await Registration.findOne({ eventID, vehicleID: finalVehicleID });
    if (existing) return res.status(400).json({ message: 'This vehicle is already registered for this event' });

    const registration = await Registration.create({ eventID, vehicleID: finalVehicleID, tShirtSize, registrationStatus: 'Pending' });
    const populated = await Registration.findById(registration._id)
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone club' } })
      .populate('eventID', 'eventName date location status');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone club' } })
      .populate('eventID', 'eventName date location status');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json({ message: 'Registration deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
