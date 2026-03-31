const router = require('express').Router();
const ctrl = require('../controllers/registrantController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('admin', 'organizer', 'staff'), ctrl.getAllRegistrants);
router.post('/', auth, authorize('admin', 'organizer', 'staff', 'registrant'), ctrl.createRegistrant);
router.get('/vehicles', auth, authorize('admin', 'organizer', 'staff'), ctrl.getAllVehicles);
router.get('/:registrantId/vehicles', auth, ctrl.getVehiclesByRegistrant);
router.post('/vehicles', auth, authorize('admin', 'organizer', 'staff', 'registrant'), ctrl.createVehicle);

module.exports = router;
