const Payment = require('../models/Payment');
const Registration = require('../models/Registration');

exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'registrationID',
        populate: [
          { path: 'eventID', select: 'eventName date' },
          { path: 'vehicleID', populate: { path: 'registrantID', select: 'name email' } }
        ]
      })
      .populate('userID', 'name email role')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userID: req.user.id })
      .populate({
        path: 'registrationID',
        populate: [
          { path: 'eventID', select: 'eventName date' },
          { path: 'vehicleID', populate: { path: 'registrantID', select: 'name email' } }
        ]
      })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { registrationID, sponsorshipID, vendorBookingID, method, amount, transactionRef, paymentType } = req.body;
    if (!method || !amount || !transactionRef) {
      return res.status(400).json({ message: 'method, amount, and transactionRef are required' });
    }

    // Enforce unique transactionRef
    const existingRef = await Payment.findOne({ transactionRef });
    if (existingRef) return res.status(400).json({ message: 'Transaction reference already exists' });

    const payment = await Payment.create({
      registrationID,
      sponsorshipID,
      vendorBookingID,
      userID: req.user.id,
      paymentType: paymentType || 'registration',
      method,
      amount,
      transactionRef,
      paymentDate: new Date()
    });

    // Auto-update registration status to Confirmed if registration payment
    if (registrationID) {
      await Registration.findByIdAndUpdate(registrationID, { registrationStatus: 'Confirmed' });
    }

    const populated = await Payment.findById(payment._id).populate({
      path: 'registrationID',
      populate: [
        { path: 'eventID', select: 'eventName date' },
        { path: 'vehicleID', populate: { path: 'registrantID', select: 'name email' } }
      ]
    });

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Transaction reference already exists' });
    res.status(500).json({ message: err.message });
  }
};
