const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/dashboard', auth, authorize('admin', 'organizer'), ctrl.dashboardSummary);
router.get('/revenue', auth, authorize('admin', 'organizer'), ctrl.revenueByEvent);
router.get('/donations', auth, authorize('admin', 'organizer'), ctrl.donationsByEvent);
router.get('/expenses', auth, authorize('admin', 'organizer'), ctrl.expensesByEvent);
router.get('/profit-loss', auth, authorize('admin', 'organizer'), ctrl.profitLoss);
router.get('/pending-payments', auth, authorize('admin', 'organizer', 'staff'), ctrl.pendingPayments);
router.get('/sponsor-breakdown', auth, authorize('admin', 'organizer'), ctrl.sponsorBreakdown);
router.get('/vendor-breakdown', auth, authorize('admin', 'organizer'), ctrl.vendorBreakdown);

module.exports = router;
