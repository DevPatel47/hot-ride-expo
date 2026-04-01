const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const { getOrganizerRegistrationIds, isOrganizer, organizerOwnsRegistration } = require('../utils/organizerScope');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (isOrganizer(req.user)) {
      const registrationIds = await getOrganizerRegistrationIds(req.user.id);
      filter.registrationID = { $in: registrationIds };
    }
    const payments = await Payment.find(filter)
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
    let registration = null;
    let finalAmount = amount;

    if (registrationID) {
      registration = await Registration.findById(registrationID).populate('eventID', 'registrationFee eventName');
      if (!registration) {
        return res.status(400).json({ message: 'Registration not found' });
      }
    }

    if (paymentType === 'registration' || registrationID) {
      if (!registration) {
        return res.status(400).json({ message: 'registrationID is required for registration payments' });
      }
      finalAmount = registration.eventID?.registrationFee;
    }

    if (!method || finalAmount === undefined || finalAmount === null || !transactionRef) {
      return res.status(400).json({ message: 'method, amount, and transactionRef are required' });
    }

    finalAmount = Number(finalAmount);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }
    if (req.user.role === 'organizer') {
      if (!registrationID) {
        return res.status(400).json({ message: 'Organizers can only record registration payments for their own events' });
      }
      if (!(await organizerOwnsRegistration(req.user, registrationID))) {
        return res.status(403).json({ message: 'You can only record payments for registrations in your own events' });
      }
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
      amount: finalAmount,
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
        { path: 'eventID', select: 'eventName date registrationFee' },
        { path: 'vehicleID', populate: { path: 'registrantID', select: 'name email' } }
      ]
    });

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Transaction reference already exists' });
    res.status(500).json({ message: err.message });
  }
};
