const router = require('express').Router();
const ctrl = require('../controllers/vendorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.post('/', auth, authorize('admin', 'organizer', 'vendor'), ctrl.create);
router.get('/event-vendors', auth, authorize('admin', 'organizer'), ctrl.getEventVendors);
router.get('/my', auth, authorize('vendor'), ctrl.getMyBooths);
router.post('/event-vendors', auth, authorize('admin', 'organizer', 'vendor'), ctrl.createEventVendor);

module.exports = router;
