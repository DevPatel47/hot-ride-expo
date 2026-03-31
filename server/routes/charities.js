const router = require('express').Router();
const ctrl = require('../controllers/charityController');
const auth = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.post('/', auth, ctrl.create);

module.exports = router;
