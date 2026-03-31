const router = require('express').Router();
const ctrl = require('../controllers/donationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/my', auth, authorize('donor'), ctrl.getMyDonations);
router.get('/', auth, authorize('admin', 'organizer'), ctrl.getAll);
router.post('/', auth, authorize('admin', 'organizer', 'donor'), ctrl.create);
router.delete('/:id', auth, authorize('admin', 'organizer'), ctrl.remove);

module.exports = router;
