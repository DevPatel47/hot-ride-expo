const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth, authorize('admin', 'organizer'), ctrl.create);
router.put('/:id', auth, authorize('admin', 'organizer'), ctrl.update);
router.delete('/:id', auth, authorize('admin', 'organizer'), ctrl.remove);

module.exports = router;
