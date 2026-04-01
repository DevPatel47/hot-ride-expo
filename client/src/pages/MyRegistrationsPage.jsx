import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineX, HiOutlineTicket } from 'react-icons/hi';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(null);
  const [payForm, setPayForm] = useState({ method: 'Card' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/registrations/my')
      .then((response) => setRegistrations(response.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ref = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      await api.post('/payments', {
        registrationID: showPayment._id,
        method: payForm.method,
        transactionRef: ref,
        paymentType: 'registration'
      });
      toast.success('Payment successful! Registration confirmed.');
      setShowPayment(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const paymentAmount = Number(showPayment?.eventID?.registrationFee ?? 75);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text">My Registrations</h1>
          <p className="text-sm text-text-muted mt-1">See the vehicles you already registered and pay for any pending entries</p>
        </div>
        <Link to="/dashboard/browse-events" className="btn-primary flex items-center gap-2">
          <HiOutlineCalendar className="w-4 h-4" /> Browse Events
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineTicket className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">You have no registrations yet.</p>
          <Link to="/dashboard/browse-events" className="btn-primary inline-flex items-center gap-2 mt-5">
            <HiOutlineCalendar className="w-4 h-4" /> Browse Events to Register
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((registration, index) => (
            <motion.div key={registration._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{registration.eventID?.eventName}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {registration.vehicleID?.year} {registration.vehicleID?.make} {registration.vehicleID?.model} | T-Shirt: {registration.tShirtSize}
                  </p>
                  <p className="text-xs text-text-faint mt-0.5">
                    {registration.eventID?.date ? new Date(registration.eventID.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${registration.registrationStatus === 'Confirmed' ? 'badge-success' : registration.registrationStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {registration.registrationStatus}
                  </span>
                  {registration.registrationStatus === 'Pending' && (
                    <button onClick={() => { setShowPayment(registration); setPayForm({ method: 'Card' }); }} className="btn-primary text-xs py-1.5 px-4">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPayment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Make Payment</h2>
                <button onClick={() => setShowPayment(null)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-text">{showPayment.eventID?.eventName}</p>
                <p className="text-xs text-text-muted">{showPayment.vehicleID?.year} {showPayment.vehicleID?.make} {showPayment.vehicleID?.model}</p>
                <p className="text-xs text-brand mt-2">Registration Fee: ${paymentAmount.toLocaleString()}</p>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Payment Method</label>
                  <select value={payForm.method} onChange={(e) => setPayForm((prev) => ({ ...prev, method: e.target.value }))} className="input-field">
                    {['Card', 'Cash', 'E-transfer', 'PayPal', 'Interac'].map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Processing...' : 'Confirm Payment'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
