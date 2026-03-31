const router = require('express').Router();
const ctrl = require('../controllers/sponsorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.post('/', auth, authorize('admin', 'organizer', 'sponsor'), ctrl.create);
router.get('/packages', ctrl.getPackages);
router.post('/packages', auth, authorize('admin', 'organizer'), ctrl.createPackage);
router.get('/event-sponsors', auth, authorize('admin', 'organizer'), ctrl.getEventSponsors);
router.get('/my', auth, authorize('sponsor'), ctrl.getMySponsorships);
router.post('/event-sponsors', auth, authorize('admin', 'organizer', 'sponsor'), ctrl.createEventSponsor);

module.exports = router;
