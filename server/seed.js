require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Charity = require('./models/Charity');
const Event = require('./models/Event');
const Registrant = require('./models/Registrant');
const Vehicle = require('./models/Vehicle');
const Registration = require('./models/Registration');
const Payment = require('./models/Payment');
const Sponsor = require('./models/Sponsor');
const SponsorPackage = require('./models/SponsorPackage');
const EventSponsor = require('./models/EventSponsor');
const Vendor = require('./models/Vendor');
const EventVendor = require('./models/EventVendor');
const Donation = require('./models/Donation');
const Expense = require('./models/Expense');

async function seed() {
  await connectDB();

  // Clear all collections
  await Promise.all([
    User.deleteMany(), Charity.deleteMany(), Event.deleteMany(),
    Registrant.deleteMany(), Vehicle.deleteMany(), Registration.deleteMany(),
    Payment.deleteMany(), Sponsor.deleteMany(), SponsorPackage.deleteMany(),
    EventSponsor.deleteMany(), Vendor.deleteMany(), EventVendor.deleteMany(),
    Donation.deleteMany(), Expense.deleteMany()
  ]);

  console.log('Cleared all collections');

  // --- Users (all 7 roles) ---
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const users = await User.insertMany([
    { name: 'Marcus Rivera', email: 'admin@hotrides.com', password: hashedPassword, role: 'admin', phone: '416-555-0001' },
    { name: 'Sarah Chen', email: 'organizer@hotrides.com', password: hashedPassword, role: 'organizer', phone: '604-555-0002' },
    { name: 'Tony Castellano', email: 'registrant@hotrides.com', password: hashedPassword, role: 'registrant', phone: '416-555-0101', club: 'GTA Muscle Cars' },
    { name: 'AutoZone Performance', email: 'sponsor@hotrides.com', password: hashedPassword, role: 'sponsor', phone: '800-555-1001', company: 'AutoZone Performance' },
    { name: 'Classic Parts Depot', email: 'vendor@hotrides.com', password: hashedPassword, role: 'vendor', phone: '905-555-2001', company: 'Classic Parts Depot' },
    { name: 'Robert Walker', email: 'donor@hotrides.com', password: hashedPassword, role: 'donor', phone: '416-555-0901' },
    { name: 'James Patterson', email: 'staff@hotrides.com', password: hashedPassword, role: 'staff', phone: '403-555-0303' },
    // Additional users
    { name: 'David Kim', email: 'david.kim@yahoo.com', password: hashedPassword, role: 'registrant', phone: '604-555-0202', club: 'Pacific Cruisers' },
    { name: 'Rachel Thompson', email: 'rachel.t@hotmail.com', password: hashedPassword, role: 'registrant', phone: '403-555-0303', club: 'Prairie Thunder' },
  ]);
  console.log('Seeded users (7 roles)');

  // --- Charities ---
  const charities = await Charity.insertMany([
    { charityName: 'Children\'s Hospital Foundation', contactPerson: 'Dr. Emily Watson', contactEmail: 'emily@chf.org' },
    { charityName: 'Veterans Auto Restoration', contactPerson: 'Mike Torres', contactEmail: 'mike@var.org' },
    { charityName: 'Wheels for Change', contactPerson: 'Linda Park', contactEmail: 'linda@wfc.org' }
  ]);
  console.log('Seeded charities');

  // --- Events ---
  const events = await Event.insertMany([
    { eventName: 'Summer Thunder Classic 2025', date: new Date('2025-07-15'), location: 'Riverside Exhibition Center, Toronto', description: 'The biggest classic car show in Ontario featuring over 200 vehicles.', registrationFee: 75, organizerID: users[1]._id, charityID: charities[0]._id, status: 'Open' },
    { eventName: 'Fall Chrome & Steel Show', date: new Date('2025-09-22'), location: 'Lakeside Convention Hall, Vancouver', description: 'West Coast premier chrome and steel vehicle exhibition.', registrationFee: 85, organizerID: users[1]._id, charityID: charities[1]._id, status: 'Open' },
    { eventName: 'Spring Hot Rod Rally 2025', date: new Date('2025-04-10'), location: 'Heritage Park, Calgary', description: 'Annual spring rally featuring hot rods and custom builds.', registrationFee: 65, organizerID: users[0]._id, charityID: charities[2]._id, status: 'Closed' }
  ]);
  console.log('Seeded events');

  // --- Registrants (linked to user accounts) ---
  const registrants = await Registrant.insertMany([
    { userID: users[2]._id, name: 'Tony Castellano', email: 'registrant@hotrides.com', phone: '416-555-0101', club: 'GTA Muscle Cars' },
    { name: 'David Kim', userID: users[7]._id, email: 'david.kim@yahoo.com', phone: '604-555-0202', club: 'Pacific Cruisers' },
    { name: 'Rachel Thompson', userID: users[8]._id, email: 'rachel.t@hotmail.com', phone: '403-555-0303', club: 'Prairie Thunder' },
    { name: 'Carlos Mendez', email: 'carlos.m@gmail.com', phone: '416-555-0404', club: 'GTA Muscle Cars' },
    { name: 'Nicole Stewart', email: 'nicole.s@outlook.com', phone: '604-555-0505', club: '' },
    { name: 'Brandon Lee', email: 'brandon.lee@gmail.com', phone: '403-555-0606', club: 'Prairie Thunder' },
    { name: 'Angela Morrison', email: 'angela.m@yahoo.com', phone: '416-555-0707', club: 'Classic Wheels TO' },
    { name: 'Ryan Cooper', email: 'ryan.c@gmail.com', phone: '604-555-0808', club: 'Pacific Cruisers' }
  ]);
  console.log('Seeded registrants');

  // --- Vehicles ---
  const vehicles = await Vehicle.insertMany([
    { registrantID: registrants[0]._id, make: 'Ford', model: 'Mustang GT', year: 1969 },
    { registrantID: registrants[1]._id, make: 'Chevrolet', model: 'Camaro SS', year: 1970 },
    { registrantID: registrants[2]._id, make: 'Dodge', model: 'Challenger R/T', year: 1971 },
    { registrantID: registrants[3]._id, make: 'Pontiac', model: 'GTO', year: 1967 },
    { registrantID: registrants[4]._id, make: 'Plymouth', model: 'Barracuda', year: 1970 },
    { registrantID: registrants[5]._id, make: 'Chevrolet', model: 'Chevelle SS', year: 1968 },
    { registrantID: registrants[6]._id, make: 'Ford', model: 'Shelby GT500', year: 1967 },
    { registrantID: registrants[7]._id, make: 'Dodge', model: 'Charger', year: 1969 },
    { registrantID: registrants[0]._id, make: 'Chevrolet', model: 'Corvette Stingray', year: 1963 },
    { registrantID: registrants[1]._id, make: 'Ford', model: 'Thunderbird', year: 1957 }
  ]);
  console.log('Seeded vehicles');

  // --- Registrations ---
  const registrations = await Registration.insertMany([
    { eventID: events[0]._id, vehicleID: vehicles[0]._id, tShirtSize: 'L', registrationStatus: 'Confirmed' },
    { eventID: events[0]._id, vehicleID: vehicles[1]._id, tShirtSize: 'XL', registrationStatus: 'Confirmed' },
    { eventID: events[0]._id, vehicleID: vehicles[2]._id, tShirtSize: 'M', registrationStatus: 'Pending' },
    { eventID: events[0]._id, vehicleID: vehicles[3]._id, tShirtSize: 'L', registrationStatus: 'Confirmed' },
    { eventID: events[0]._id, vehicleID: vehicles[8]._id, tShirtSize: 'L', registrationStatus: 'Pending' },
    { eventID: events[1]._id, vehicleID: vehicles[4]._id, tShirtSize: 'S', registrationStatus: 'Confirmed' },
    { eventID: events[1]._id, vehicleID: vehicles[5]._id, tShirtSize: 'XXL', registrationStatus: 'Pending' },
    { eventID: events[1]._id, vehicleID: vehicles[7]._id, tShirtSize: 'L', registrationStatus: 'Confirmed' },
    { eventID: events[2]._id, vehicleID: vehicles[6]._id, tShirtSize: 'M', registrationStatus: 'Confirmed' },
    { eventID: events[2]._id, vehicleID: vehicles[9]._id, tShirtSize: 'L', registrationStatus: 'Confirmed' },
    { eventID: events[2]._id, vehicleID: vehicles[2]._id, tShirtSize: 'M', registrationStatus: 'Pending' }
  ]);
  console.log('Seeded registrations');

  // --- Payments ---
  await Payment.insertMany([
    { registrationID: registrations[0]._id, userID: users[2]._id, paymentType: 'registration', method: 'Card', amount: 75, paymentDate: new Date('2025-06-01'), transactionRef: 'TXN-2025-001' },
    { registrationID: registrations[1]._id, paymentType: 'registration', method: 'E-transfer', amount: 75, paymentDate: new Date('2025-06-05'), transactionRef: 'TXN-2025-002' },
    { registrationID: registrations[3]._id, paymentType: 'registration', method: 'Cash', amount: 75, paymentDate: new Date('2025-06-10'), transactionRef: 'TXN-2025-003' },
    { registrationID: registrations[5]._id, paymentType: 'registration', method: 'PayPal', amount: 85, paymentDate: new Date('2025-08-01'), transactionRef: 'TXN-2025-004' },
    { registrationID: registrations[7]._id, paymentType: 'registration', method: 'Interac', amount: 85, paymentDate: new Date('2025-08-15'), transactionRef: 'TXN-2025-005' },
    { registrationID: registrations[8]._id, paymentType: 'registration', method: 'Card', amount: 65, paymentDate: new Date('2025-03-20'), transactionRef: 'TXN-2025-006' },
    { registrationID: registrations[9]._id, paymentType: 'registration', method: 'Interac', amount: 65, paymentDate: new Date('2025-03-25'), transactionRef: 'TXN-2025-007' }
  ]);
  console.log('Seeded payments');

  // --- Sponsors (linked to user accounts) ---
  const sponsors = await Sponsor.insertMany([
    { userID: users[3]._id, name: 'AutoZone Performance', contactEmail: 'sponsor@hotrides.com', phone: '800-555-1001' },
    { name: 'Shell V-Power Racing', contactEmail: 'racing@shell.com', phone: '800-555-1002' },
    { name: 'Meguiar\'s Detailing', contactEmail: 'events@meguiars.com', phone: '800-555-1003' },
    { name: 'Summit Racing Equipment', contactEmail: 'promos@summitracing.com', phone: '800-555-1004' }
  ]);
  console.log('Seeded sponsors');

  // --- Sponsor Packages ---
  const packages = await SponsorPackage.insertMany([
    { eventID: events[0]._id, packageName: 'Platinum Sponsor', description: 'Logo on banners, 10x10 booth, PA mentions', basePrice: 5000 },
    { eventID: events[0]._id, packageName: 'Gold Sponsor', description: 'Logo on banners, 8x8 booth', basePrice: 3000 },
    { eventID: events[0]._id, packageName: 'Silver Sponsor', description: 'Logo on handout materials', basePrice: 1500 },
    { eventID: events[1]._id, packageName: 'Title Sponsor', description: 'Full event branding, exclusive booth area', basePrice: 8000 },
    { eventID: events[1]._id, packageName: 'Gold Sponsor', description: 'Logo on banners, 8x8 booth', basePrice: 3500 },
    { eventID: events[2]._id, packageName: 'Platinum Sponsor', description: 'Logo on banners, 10x10 booth, PA mentions', basePrice: 4500 },
    { eventID: events[2]._id, packageName: 'Bronze Sponsor', description: 'Logo on website', basePrice: 1000 }
  ]);
  console.log('Seeded sponsor packages');

  // --- Event Sponsors ---
  await EventSponsor.insertMany([
    { sponsorID: sponsors[0]._id, packageID: packages[0]._id, amountPaid: 5000 },
    { sponsorID: sponsors[1]._id, packageID: packages[1]._id, amountPaid: 3000 },
    { sponsorID: sponsors[2]._id, packageID: packages[2]._id, amountPaid: 1500 },
    { sponsorID: sponsors[3]._id, packageID: packages[3]._id, amountPaid: 8000 },
    { sponsorID: sponsors[0]._id, packageID: packages[4]._id, amountPaid: 3500 },
    { sponsorID: sponsors[1]._id, packageID: packages[5]._id, amountPaid: 4500 },
    { sponsorID: sponsors[2]._id, packageID: packages[6]._id, amountPaid: 1000 }
  ]);
  console.log('Seeded event sponsors');

  // --- Vendors (linked to user accounts) ---
  const vendors = await Vendor.insertMany([
    { userID: users[4]._id, name: 'Classic Parts Depot', contactEmail: 'vendor@hotrides.com', phone: '905-555-2001' },
    { name: 'Hot Rod Diner', contactEmail: 'catering@hrdiner.com', phone: '905-555-2002' },
    { name: 'Chrome & Custom Accessories', contactEmail: 'info@chromecustom.com', phone: '905-555-2003' },
    { name: 'Vintage Vinyl Wraps', contactEmail: 'design@vintagewraps.com', phone: '905-555-2004' }
  ]);
  console.log('Seeded vendors');

  // --- Event Vendors ---
  await EventVendor.insertMany([
    { eventID: events[0]._id, vendorID: vendors[0]._id, boothNumber: 'A-01', amountPaid: 500 },
    { eventID: events[0]._id, vendorID: vendors[1]._id, boothNumber: 'F-01', amountPaid: 750 },
    { eventID: events[0]._id, vendorID: vendors[2]._id, boothNumber: 'A-02', amountPaid: 500 },
    { eventID: events[1]._id, vendorID: vendors[3]._id, boothNumber: 'B-01', amountPaid: 600 },
    { eventID: events[1]._id, vendorID: vendors[0]._id, boothNumber: 'B-02', amountPaid: 550 },
    { eventID: events[2]._id, vendorID: vendors[1]._id, boothNumber: 'C-01', amountPaid: 450 },
    { eventID: events[2]._id, vendorID: vendors[2]._id, boothNumber: 'C-02', amountPaid: 400 }
  ]);
  console.log('Seeded event vendors');

  // --- Donations (linked to donor user) ---
  await Donation.insertMany([
    { eventID: events[0]._id, donorID: users[5]._id, donorName: 'Robert Walker', donorEmail: 'donor@hotrides.com', donationType: 'Cash', estimatedValue: 2500, receiptNumber: 'DON-2025-001' },
    { eventID: events[0]._id, donorName: 'Classic Car Museum', donationType: 'Item', description: 'Vintage car parts collection', estimatedValue: 1500, receiptNumber: 'DON-2025-002' },
    { eventID: events[0]._id, donorName: 'Jenna Automotive', donationType: 'Service', description: 'Free detailing services for 5 vehicles', estimatedValue: 800, receiptNumber: 'DON-2025-003' },
    { eventID: events[1]._id, donorID: users[5]._id, donorName: 'Robert Walker', donorEmail: 'donor@hotrides.com', donationType: 'Cash', estimatedValue: 3000, receiptNumber: 'DON-2025-004' },
    { eventID: events[1]._id, donorName: 'West Coast Customs', donationType: 'Vehicle', description: 'Custom restored 1965 Shelby Cobra', estimatedValue: 15000, receiptNumber: 'DON-2025-005' },
    { eventID: events[2]._id, donorName: 'Alberta Heritage Foundation', donationType: 'Cash', estimatedValue: 5000, receiptNumber: 'DON-2025-006' },
    { eventID: events[2]._id, donorName: 'Motor City Supplies', donationType: 'Item', description: 'Engine rebuild kits', estimatedValue: 2000, receiptNumber: 'DON-2025-007' }
  ]);
  console.log('Seeded donations');

  // --- Expenses ---
  await Expense.insertMany([
    { eventID: events[0]._id, description: 'Venue Rental - Riverside Exhibition Center', amount: 3500, expenseDate: new Date('2025-06-01') },
    { eventID: events[0]._id, description: 'Sound & Stage Equipment', amount: 1200, expenseDate: new Date('2025-06-10') },
    { eventID: events[0]._id, description: 'Insurance Coverage', amount: 800, expenseDate: new Date('2025-05-15') },
    { eventID: events[0]._id, description: 'Marketing & Advertising', amount: 1500, expenseDate: new Date('2025-04-01') },
    { eventID: events[0]._id, description: 'Trophies & Awards', amount: 600, expenseDate: new Date('2025-06-20') },
    { eventID: events[1]._id, description: 'Venue Rental - Lakeside Convention Hall', amount: 4000, expenseDate: new Date('2025-08-01') },
    { eventID: events[1]._id, description: 'Security Services', amount: 1800, expenseDate: new Date('2025-08-10') },
    { eventID: events[1]._id, description: 'Printed Materials', amount: 450, expenseDate: new Date('2025-07-20') },
    { eventID: events[2]._id, description: 'Venue Rental - Heritage Park', amount: 2800, expenseDate: new Date('2025-02-15') },
    { eventID: events[2]._id, description: 'Catering Services', amount: 2200, expenseDate: new Date('2025-03-01') },
    { eventID: events[2]._id, description: 'Photography & Videography', amount: 900, expenseDate: new Date('2025-03-05') }
  ]);
  console.log('Seeded expenses');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Login Credentials (password: admin123):');
  console.log('   Admin:      admin@hotrides.com');
  console.log('   Organizer:  organizer@hotrides.com');
  console.log('   Registrant: registrant@hotrides.com');
  console.log('   Sponsor:    sponsor@hotrides.com');
  console.log('   Vendor:     vendor@hotrides.com');
  console.log('   Donor:      donor@hotrides.com');
  console.log('   Staff:      staff@hotrides.com');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
