const router = require('express').Router();
const ctrl = require('../controllers/registrationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/my', auth, authorize('registrant'), ctrl.getMyRegistrations);
router.get('/', auth, authorize('admin', 'organizer', 'staff'), ctrl.getAll);
router.get('/:id', auth, authorize('admin', 'organizer', 'staff', 'registrant'), ctrl.getById);
router.post('/', auth, authorize('admin', 'organizer', 'registrant', 'staff'), ctrl.create);
router.put('/:id', auth, authorize('admin', 'organizer', 'staff'), ctrl.update);
router.delete('/:id', auth, authorize('admin', 'organizer'), ctrl.remove);

module.exports = router;
