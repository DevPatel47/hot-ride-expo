const Registrant = require('../models/Registrant');
const Vehicle = require('../models/Vehicle');

// --- Registrants ---
exports.getAllRegistrants = async (req, res) => {
  try {
    const registrants = await Registrant.find().sort({ createdAt: -1 });
    res.json(registrants);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRegistrant = async (req, res) => {
  try {
    const { name, email, phone, club } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ message: 'name, email, and phone are required' });
    const registrant = await Registrant.create({ name, email, phone, club });
    res.status(201).json(registrant);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

// --- Vehicles ---
exports.getVehiclesByRegistrant = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ registrantID: req.params.registrantId });
    res.json(vehicles);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createVehicle = async (req, res) => {
  try {
    const { registrantID, make, model, year } = req.body;
    if (!registrantID || !make || !model || !year) {
      return res.status(400).json({ message: 'registrantID, make, model, and year are required' });
    }
    const vehicle = await Vehicle.create({ registrantID, make, model, year });
    res.status(201).json(vehicle);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('registrantID', 'name email');
    res.json(vehicles);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
