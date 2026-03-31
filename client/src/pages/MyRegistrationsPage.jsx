import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineTicket } from 'react-icons/hi';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [regForm, setRegForm] = useState({ eventID: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', tShirtSize: 'L' });
  const [payForm, setPayForm] = useState({ method: 'Card', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/registrations/my'), api.get('/events')])
      .then(([r, e]) => { setRegistrations(r.data); setEvents(e.data.filter(ev => ev.status === 'Open')); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/registrations', regForm);
      toast.success('Vehicle registered! Payment pending.');
      setShowRegister(false);
      setRegForm({ eventID: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', tShirtSize: 'L' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ref = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      await api.post('/payments', {
        registrationID: showPayment._id,
        method: payForm.method,
        amount: parseFloat(payForm.amount),
        transactionRef: ref,
        paymentType: 'registration'
      });
      toast.success('Payment successful! Registration confirmed.');
      setShowPayment(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">My Registrations</h1>
          <p className="text-sm text-text-muted mt-1">Manage your event registrations & payments</p>
        </div>
        <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Register Vehicle
        </button>
      </div>

      {/* Registration list */}
      {registrations.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineTicket className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">No registrations yet. Register your first vehicle!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{r.eventID?.eventName}</p>
                  <p className="text-xs text-text-muted mt-1">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model} • T-Shirt: {r.tShirtSize}</p>
                  <p className="text-xs text-text-faint mt-0.5">
                    {r.eventID?.date ? new Date(r.eventID.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${r.registrationStatus === 'Confirmed' ? 'badge-success' : r.registrationStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {r.registrationStatus}
                  </span>
                  {r.registrationStatus === 'Pending' && (
                    <button onClick={() => { setShowPayment(r); setPayForm({ method: 'Card', amount: r.eventID?.registrationFee || 75 }); }} className="btn-primary text-xs py-1.5 px-4">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Register for Event</h2>
                <button onClick={() => setShowRegister(false)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Event</label>
                  <select value={regForm.eventID} onChange={e => setRegForm(p => ({ ...p, eventID: e.target.value }))} className="input-field" required>
                    <option value="">Select an event</option>
                    {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName} — {new Date(ev.date).toLocaleDateString()}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Make</label>
                    <input value={regForm.vehicleMake} onChange={e => setRegForm(p => ({ ...p, vehicleMake: e.target.value }))} className="input-field" placeholder="Ford" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Model</label>
                    <input value={regForm.vehicleModel} onChange={e => setRegForm(p => ({ ...p, vehicleModel: e.target.value }))} className="input-field" placeholder="Mustang" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Year</label>
                    <input type="number" value={regForm.vehicleYear} onChange={e => setRegForm(p => ({ ...p, vehicleYear: e.target.value }))} className="input-field" placeholder="1969" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">T-Shirt Size</label>
                  <select value={regForm.tShirtSize} onChange={e => setRegForm(p => ({ ...p, tShirtSize: e.target.value }))} className="input-field">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Registering…' : 'Register Vehicle'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
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
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Payment Method</label>
                  <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))} className="input-field">
                    {['Card', 'Cash', 'E-transfer', 'PayPal', 'Interac'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Amount ($)</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} className="input-field" required min="1" step="0.01" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Processing…' : 'Confirm Payment'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
