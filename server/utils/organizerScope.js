const Event = require('../models/Event');
const Registration = require('../models/Registration');
const SponsorPackage = require('../models/SponsorPackage');

const isOrganizer = (user) => user?.role === 'organizer';

async function getOrganizerEventIds(userId) {
  return Event.find({ organizerID: userId }).distinct('_id');
}

async function getOrganizerRegistrationIds(userId) {
  const eventIds = await getOrganizerEventIds(userId);
  if (!eventIds.length) return [];
  return Registration.find({ eventID: { $in: eventIds } }).distinct('_id');
}

async function getOrganizerPackageIds(userId) {
  const eventIds = await getOrganizerEventIds(userId);
  if (!eventIds.length) return [];
  return SponsorPackage.find({ eventID: { $in: eventIds } }).distinct('_id');
}

async function organizerOwnsEvent(user, eventId) {
  if (!isOrganizer(user)) return true;
  return !!await Event.exists({ _id: eventId, organizerID: user.id });
}

async function organizerOwnsRegistration(user, registrationId) {
  if (!isOrganizer(user)) return true;
  const registration = await Registration.findById(registrationId).select('eventID');
  if (!registration) return false;
  return organizerOwnsEvent(user, registration.eventID);
}

async function organizerOwnsPackage(user, packageId) {
  if (!isOrganizer(user)) return true;
  const sponsorPackage = await SponsorPackage.findById(packageId).select('eventID');
  if (!sponsorPackage) return false;
  return organizerOwnsEvent(user, sponsorPackage.eventID);
}

module.exports = {
  getOrganizerEventIds,
  getOrganizerPackageIds,
  getOrganizerRegistrationIds,
  isOrganizer,
  organizerOwnsEvent,
  organizerOwnsPackage,
  organizerOwnsRegistration,
};
