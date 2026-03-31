const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const EventSponsor = require('../models/EventSponsor');
const EventVendor = require('../models/EventVendor');
const Event = require('../models/Event');
const mongoose = require('mongoose');

// Total revenue per event (from payments)
exports.revenueByEvent = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'registrations', localField: 'registrationID', foreignField: '_id', as: 'registration'
        }
      },
      { $unwind: '$registration' },
      {
        $group: {
          _id: '$registration.eventID',
          totalRevenue: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events', localField: '_id', foreignField: '_id', as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 0,
          eventID: '$_id',
          eventName: '$event.eventName',
          eventDate: '$event.date',
          totalRevenue: 1,
          paymentCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ];
    const result = await Payment.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Total donations per event
exports.donationsByEvent = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$eventID',
          totalDonations: { $sum: '$estimatedValue' },
          donationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events', localField: '_id', foreignField: '_id', as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 0,
          eventID: '$_id',
          eventName: '$event.eventName',
          totalDonations: 1,
          donationCount: 1
        }
      },
      { $sort: { totalDonations: -1 } }
    ];
    const result = await Donation.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Total expenses per event
exports.expensesByEvent = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$eventID',
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events', localField: '_id', foreignField: '_id', as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 0,
          eventID: '$_id',
          eventName: '$event.eventName',
          totalExpenses: 1,
          expenseCount: 1
        }
      },
      { $sort: { totalExpenses: -1 } }
    ];
    const result = await Expense.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Profit/Loss per event
exports.profitLoss = async (req, res) => {
  try {
    const events = await Event.find().select('_id eventName date');

    const results = [];
    for (const event of events) {
      const eid = event._id;

      // Revenue from payments
      const revenueAgg = await Payment.aggregate([
        { $lookup: { from: 'registrations', localField: 'registrationID', foreignField: '_id', as: 'reg' } },
        { $unwind: '$reg' },
        { $match: { 'reg.eventID': eid } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Sponsor revenue
      const sponsorAgg = await EventSponsor.aggregate([
        { $lookup: { from: 'sponsorpackages', localField: 'packageID', foreignField: '_id', as: 'pkg' } },
        { $unwind: '$pkg' },
        { $match: { 'pkg.eventID': eid } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);

      // Vendor revenue
      const vendorAgg = await EventVendor.aggregate([
        { $match: { eventID: eid } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);

      // Donations
      const donationAgg = await Donation.aggregate([
        { $match: { eventID: eid } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
      ]);

      // Expenses
      const expenseAgg = await Expense.aggregate([
        { $match: { eventID: eid } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const revenue = (revenueAgg[0]?.total || 0) + (sponsorAgg[0]?.total || 0) + (vendorAgg[0]?.total || 0);
      const donations = donationAgg[0]?.total || 0;
      const expenses = expenseAgg[0]?.total || 0;

      results.push({
        eventID: eid,
        eventName: event.eventName,
        eventDate: event.date,
        revenue,
        donations,
        expenses,
        profitLoss: revenue + donations - expenses
      });
    }

    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Pending payments (registrations not confirmed)
exports.pendingPayments = async (req, res) => {
  try {
    const pending = await Registration.find({ registrationStatus: 'Pending' })
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone' } })
      .populate('eventID', 'eventName date');
    res.json(pending);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Sponsor revenue breakdown
exports.sponsorBreakdown = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: { from: 'sponsors', localField: 'sponsorID', foreignField: '_id', as: 'sponsor' }
      },
      { $unwind: '$sponsor' },
      {
        $lookup: { from: 'sponsorpackages', localField: 'packageID', foreignField: '_id', as: 'package' }
      },
      { $unwind: '$package' },
      {
        $lookup: { from: 'events', localField: 'package.eventID', foreignField: '_id', as: 'event' }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: { sponsorID: '$sponsorID', eventID: '$event._id' },
          sponsorName: { $first: '$sponsor.name' },
          eventName: { $first: '$event.eventName' },
          totalPaid: { $sum: '$amountPaid' },
          packageCount: { $sum: 1 }
        }
      },
      { $sort: { totalPaid: -1 } }
    ];
    const result = await EventSponsor.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Vendor revenue breakdown
exports.vendorBreakdown = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: { from: 'vendors', localField: 'vendorID', foreignField: '_id', as: 'vendor' }
      },
      { $unwind: '$vendor' },
      {
        $lookup: { from: 'events', localField: 'eventID', foreignField: '_id', as: 'event' }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: { vendorID: '$vendorID', eventID: '$eventID' },
          vendorName: { $first: '$vendor.name' },
          eventName: { $first: '$event.eventName' },
          totalPaid: { $sum: '$amountPaid' },
          boothCount: { $sum: 1 }
        }
      },
      { $sort: { totalPaid: -1 } }
    ];
    const result = await EventVendor.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Dashboard summary (all totals)
exports.dashboardSummary = async (req, res) => {
  try {
    const [revenueAgg] = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]) || [{ total: 0 }];

    const [donationAgg] = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ]) || [{ total: 0 }];

    const [expenseAgg] = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]) || [{ total: 0 }];

    const [sponsorAgg] = await EventSponsor.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]) || [{ total: 0 }];

    const [vendorAgg] = await EventVendor.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]) || [{ total: 0 }];

    const pendingCount = await Registration.countDocuments({ registrationStatus: 'Pending' });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    const totalRevenue = (revenueAgg?.total || 0) + (sponsorAgg?.total || 0) + (vendorAgg?.total || 0);
    const totalDonations = donationAgg?.total || 0;
    const totalExpenses = expenseAgg?.total || 0;

    res.json({
      totalRevenue,
      totalDonations,
      totalExpenses,
      profitLoss: totalRevenue + totalDonations - totalExpenses,
      pendingPayments: pendingCount,
      totalEvents,
      totalRegistrations
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
