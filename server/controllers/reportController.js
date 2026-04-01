const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const EventSponsor = require('../models/EventSponsor');
const EventVendor = require('../models/EventVendor');
const Event = require('../models/Event');
const User = require('../models/User');
const { getOrganizerEventIds, getOrganizerRegistrationIds, isOrganizer } = require('../utils/organizerScope');

async function getScopedEventIds(req) {
  if (!isOrganizer(req.user)) return null;
  return getOrganizerEventIds(req.user.id);
}

// Total revenue per event (from payments)
exports.revenueByEvent = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
    const pipeline = [
      {
        $lookup: {
          from: 'registrations', localField: 'registrationID', foreignField: '_id', as: 'registration'
        }
      },
      { $unwind: '$registration' },
    ];

    if (eventIds) {
      pipeline.push({ $match: { 'registration.eventID': { $in: eventIds } } });
    }

    pipeline.push(
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
    );

    const result = await Payment.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Total donations per event
exports.donationsByEvent = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
    const pipeline = [];

    if (eventIds) {
      pipeline.push({ $match: { eventID: { $in: eventIds } } });
    }

    pipeline.push(
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
    );

    const result = await Donation.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Total expenses per event
exports.expensesByEvent = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
    const pipeline = [];

    if (eventIds) {
      pipeline.push({ $match: { eventID: { $in: eventIds } } });
    }

    pipeline.push(
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
    );

    const result = await Expense.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Profit/Loss per event
exports.profitLoss = async (req, res) => {
  try {
    const eventFilter = isOrganizer(req.user) ? { organizerID: req.user.id } : {};
    const events = await Event.find(eventFilter).select('_id eventName date');

    const results = [];
    for (const event of events) {
      const eid = event._id;

      const revenueAgg = await Payment.aggregate([
        { $lookup: { from: 'registrations', localField: 'registrationID', foreignField: '_id', as: 'reg' } },
        { $unwind: '$reg' },
        { $match: { 'reg.eventID': eid } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const sponsorAgg = await EventSponsor.aggregate([
        { $lookup: { from: 'sponsorpackages', localField: 'packageID', foreignField: '_id', as: 'pkg' } },
        { $unwind: '$pkg' },
        { $match: { 'pkg.eventID': eid } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);

      const vendorAgg = await EventVendor.aggregate([
        { $match: { eventID: eid } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);

      const donationAgg = await Donation.aggregate([
        { $match: { eventID: eid } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
      ]);

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
    const filter = { registrationStatus: 'Pending' };
    if (isOrganizer(req.user)) {
      const eventIds = await getOrganizerEventIds(req.user.id);
      filter.eventID = { $in: eventIds };
    }

    const pending = await Registration.find(filter)
      .populate({ path: 'vehicleID', populate: { path: 'registrantID', select: 'name email phone' } })
      .populate('eventID', 'eventName date registrationFee');
    res.json(pending);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Sponsor revenue breakdown
exports.sponsorBreakdown = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
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
    ];

    if (eventIds) {
      pipeline.push({ $match: { 'event._id': { $in: eventIds } } });
    }

    pipeline.push(
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
    );

    const result = await EventSponsor.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Vendor revenue breakdown
exports.vendorBreakdown = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
    const pipeline = [
      {
        $lookup: { from: 'vendors', localField: 'vendorID', foreignField: '_id', as: 'vendor' }
      },
      { $unwind: '$vendor' },
      {
        $lookup: { from: 'events', localField: 'eventID', foreignField: '_id', as: 'event' }
      },
      { $unwind: '$event' },
    ];

    if (eventIds) {
      pipeline.push({ $match: { 'event._id': { $in: eventIds } } });
    }

    pipeline.push(
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
    );

    const result = await EventVendor.aggregate(pipeline);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin-only overview of organizer network and owned event performance
exports.adminOverview = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' })
      .select('name email phone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const organizerIds = organizers.map((organizer) => organizer._id);
    const events = organizerIds.length
      ? await Event.find({ organizerID: { $in: organizerIds } })
          .select('eventName date status location registrationFee organizerID createdAt')
          .sort({ date: -1 })
          .lean()
      : [];

    const eventIds = events.map((event) => event._id);

    const registrationStats = eventIds.length
      ? await Registration.aggregate([
          { $match: { eventID: { $in: eventIds } } },
          {
            $group: {
              _id: '$eventID',
              totalRegistrations: { $sum: 1 },
              pendingRegistrations: {
                $sum: { $cond: [{ $eq: ['$registrationStatus', 'Pending'] }, 1, 0] }
              },
              confirmedRegistrations: {
                $sum: { $cond: [{ $eq: ['$registrationStatus', 'Confirmed'] }, 1, 0] }
              }
            }
          }
        ])
      : [];

    const paymentStats = eventIds.length
      ? await Payment.aggregate([
          { $lookup: { from: 'registrations', localField: 'registrationID', foreignField: '_id', as: 'registration' } },
          { $unwind: '$registration' },
          { $match: { 'registration.eventID': { $in: eventIds } } },
          { $group: { _id: '$registration.eventID', total: { $sum: '$amount' } } }
        ])
      : [];

    const sponsorStats = eventIds.length
      ? await EventSponsor.aggregate([
          { $lookup: { from: 'sponsorpackages', localField: 'packageID', foreignField: '_id', as: 'package' } },
          { $unwind: '$package' },
          { $match: { 'package.eventID': { $in: eventIds } } },
          { $group: { _id: '$package.eventID', total: { $sum: '$amountPaid' } } }
        ])
      : [];

    const vendorStats = eventIds.length
      ? await EventVendor.aggregate([
          { $match: { eventID: { $in: eventIds } } },
          { $group: { _id: '$eventID', total: { $sum: '$amountPaid' } } }
        ])
      : [];

    const registrationMap = new Map(registrationStats.map((item) => [String(item._id), item]));
    const paymentMap = new Map(paymentStats.map((item) => [String(item._id), item.total]));
    const sponsorMap = new Map(sponsorStats.map((item) => [String(item._id), item.total]));
    const vendorMap = new Map(vendorStats.map((item) => [String(item._id), item.total]));
    const organizerMap = new Map(organizers.map((organizer) => [String(organizer._id), organizer]));

    const recentEvents = events.slice(0, 8).map((event) => ({
      _id: event._id,
      eventName: event.eventName,
      date: event.date,
      status: event.status,
      location: event.location,
      registrationFee: event.registrationFee,
      organizerName: organizerMap.get(String(event.organizerID))?.name || 'Unknown organizer',
      organizerEmail: organizerMap.get(String(event.organizerID))?.email || '',
    }));

    const organizerSummaries = organizers
      .map((organizer) => {
        const ownedEvents = events.filter((event) => String(event.organizerID) === String(organizer._id));
        const totals = ownedEvents.reduce((acc, event) => {
          const eventKey = String(event._id);
          const eventRegistrations = registrationMap.get(eventKey);
          acc.totalEvents += 1;
          acc.openEvents += event.status === 'Open' ? 1 : 0;
          acc.totalRegistrations += eventRegistrations?.totalRegistrations || 0;
          acc.pendingRegistrations += eventRegistrations?.pendingRegistrations || 0;
          acc.confirmedRegistrations += eventRegistrations?.confirmedRegistrations || 0;
          acc.totalRevenue += (paymentMap.get(eventKey) || 0) + (sponsorMap.get(eventKey) || 0) + (vendorMap.get(eventKey) || 0);
          return acc;
        }, {
          totalEvents: 0,
          openEvents: 0,
          totalRegistrations: 0,
          pendingRegistrations: 0,
          confirmedRegistrations: 0,
          totalRevenue: 0,
        });

        return {
          _id: organizer._id,
          name: organizer.name,
          email: organizer.email,
          phone: organizer.phone,
          createdAt: organizer.createdAt,
          latestEventName: ownedEvents[0]?.eventName || null,
          latestEventDate: ownedEvents[0]?.date || null,
          ...totals,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalEvents - a.totalEvents || a.name.localeCompare(b.name));

    res.json({
      organizersCount: organizers.length,
      activeOrganizers: organizerSummaries.filter((organizer) => organizer.totalEvents > 0).length,
      organizers: organizerSummaries,
      recentEvents,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Dashboard summary (all totals)
exports.dashboardSummary = async (req, res) => {
  try {
    const eventIds = await getScopedEventIds(req);
    const registrationIds = eventIds ? await getOrganizerRegistrationIds(req.user.id) : null;

    const revenuePipeline = [];
    if (registrationIds) {
      revenuePipeline.push({ $match: { registrationID: { $in: registrationIds } } });
    }
    revenuePipeline.push({ $group: { _id: null, total: { $sum: '$amount' } } });
    const [revenueAgg] = await Payment.aggregate(revenuePipeline);

    const donationPipeline = [];
    if (eventIds) {
      donationPipeline.push({ $match: { eventID: { $in: eventIds } } });
    }
    donationPipeline.push({ $group: { _id: null, total: { $sum: '$estimatedValue' } } });
    const [donationAgg] = await Donation.aggregate(donationPipeline);

    const expensePipeline = [];
    if (eventIds) {
      expensePipeline.push({ $match: { eventID: { $in: eventIds } } });
    }
    expensePipeline.push({ $group: { _id: null, total: { $sum: '$amount' } } });
    const [expenseAgg] = await Expense.aggregate(expensePipeline);

    const sponsorPipeline = [];
    if (eventIds) {
      sponsorPipeline.push(
        { $lookup: { from: 'sponsorpackages', localField: 'packageID', foreignField: '_id', as: 'pkg' } },
        { $unwind: '$pkg' },
        { $match: { 'pkg.eventID': { $in: eventIds } } }
      );
    }
    sponsorPipeline.push({ $group: { _id: null, total: { $sum: '$amountPaid' } } });
    const [sponsorAgg] = await EventSponsor.aggregate(sponsorPipeline);

    const vendorPipeline = [];
    if (eventIds) {
      vendorPipeline.push({ $match: { eventID: { $in: eventIds } } });
    }
    vendorPipeline.push({ $group: { _id: null, total: { $sum: '$amountPaid' } } });
    const [vendorAgg] = await EventVendor.aggregate(vendorPipeline);

    const pendingFilter = { registrationStatus: 'Pending' };
    if (eventIds) {
      pendingFilter.eventID = { $in: eventIds };
    }

    const eventFilter = isOrganizer(req.user) ? { organizerID: req.user.id } : {};
    const registrationFilter = eventIds ? { eventID: { $in: eventIds } } : {};

    const pendingCount = await Registration.countDocuments(pendingFilter);
    const totalEvents = await Event.countDocuments(eventFilter);
    const totalRegistrations = await Registration.countDocuments(registrationFilter);

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
