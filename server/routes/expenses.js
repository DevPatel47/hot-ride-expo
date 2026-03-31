const router = require('express').Router();
const ctrl = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('admin', 'organizer'), ctrl.getAll);
router.post('/', auth, authorize('admin', 'organizer'), ctrl.create);
router.delete('/:id', auth, authorize('admin', 'organizer'), ctrl.remove);

module.exports = router;
