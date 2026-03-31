const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/my', auth, ctrl.getMyPayments);
router.get('/', auth, authorize('admin', 'organizer', 'staff'), ctrl.getAll);
router.post('/', auth, authorize('admin', 'organizer', 'registrant', 'sponsor', 'vendor', 'staff'), ctrl.create);

module.exports = router;
