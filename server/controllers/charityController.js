const Charity = require('../models/Charity');

exports.getAll = async (req, res) => {
  try {
    const charities = await Charity.find().sort({ createdAt: -1 });
    res.json(charities);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { charityName, contactPerson, contactEmail } = req.body;
    if (!charityName || !contactPerson || !contactEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const charity = await Charity.create({ charityName, contactPerson, contactEmail });
    res.status(201).json(charity);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
