import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineClipboardCheck, HiOutlineCreditCard } from 'react-icons/hi';

export default function StaffRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [regForm, setRegForm] = useState({ eventID: '', registrantName: '', registrantEmail: '', registrantPhone: '', registrantClub: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', tShirtSize: 'L' });
  const [payForm, setPayForm] = useState({ method: 'Card', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/registrations'), api.get('/events')])
      .then(([r, e]) => { setRegistrations(r.data); setEvents(e.data.filter(ev => ev.status === 'Open')); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/registrations', regForm);
      toast.success('Registration created!');
      setShowRegModal(false);
      setRegForm({ eventID: '', registrantName: '', registrantEmail: '', registrantPhone: '', registrantClub: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', tShirtSize: 'L' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ref = 'STF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      await api.post('/payments', {
        registrationID: showPayModal._id,
        method: payForm.method,
        amount: parseFloat(payForm.amount),
        transactionRef: ref,
        paymentType: 'registration'
      });
      toast.success('Payment recorded! Registration confirmed.');
      setShowPayModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const pending = registrations.filter(r => r.registrationStatus === 'Pending');
  const confirmed = registrations.filter(r => r.registrationStatus === 'Confirmed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Staff — Registrations</h1>
          <p className="text-sm text-text-muted mt-1">Enter registrations and process payments</p>
        </div>
        <button onClick={() => setShowRegModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> New Registration
        </button>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            <HiOutlineClipboardCheck className="w-4 h-4" /> Awaiting Payment ({pending.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Registrant</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Vehicle</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Event</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Status</th>
                <th className="text-right pb-2 text-xs text-text-faint font-medium">Action</th>
              </tr></thead>
              <tbody>
                {pending.map((r, i) => (
                  <tr key={r._id} className="border-b border-border/50">
                    <td className="py-2.5 text-text">{r.vehicleID?.registrantID?.name}</td>
                    <td className="py-2.5 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td>
                    <td className="py-2.5 text-text-muted">{r.eventID?.eventName}</td>
                    <td className="py-2.5"><span className="badge badge-warning">Pending</span></td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => { setShowPayModal(r); setPayForm({ method: 'Card', amount: 75 }); }}
                        className="text-xs text-brand hover:underline flex items-center gap-1 ml-auto">
                        <HiOutlineCreditCard className="w-3.5 h-3.5" /> Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-success mb-3">Confirmed ({confirmed.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Registrant</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Vehicle</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Event</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Status</th>
              </tr></thead>
              <tbody>
                {confirmed.slice(0, 10).map((r, i) => (
                  <tr key={r._id} className="border-b border-border/50">
                    <td className="py-2.5 text-text">{r.vehicleID?.registrantID?.name}</td>
                    <td className="py-2.5 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td>
                    <td className="py-2.5 text-text-muted">{r.eventID?.eventName}</td>
                    <td className="py-2.5"><span className="badge badge-success">Confirmed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Modal */}
      <AnimatePresence>
        {showRegModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Manual Registration</h2>
                <button onClick={() => setShowRegModal(false)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Event</label>
                  <select value={regForm.eventID} onChange={e => setRegForm(p => ({ ...p, eventID: e.target.value }))} className="input-field" required>
                    <option value="">Select event</option>
                    {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Registrant Name</label>
                    <input value={regForm.registrantName} onChange={e => setRegForm(p => ({ ...p, registrantName: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
                    <input type="email" value={regForm.registrantEmail} onChange={e => setRegForm(p => ({ ...p, registrantEmail: e.target.value }))} className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Phone</label>
                    <input value={regForm.registrantPhone} onChange={e => setRegForm(p => ({ ...p, registrantPhone: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Club</label>
                    <input value={regForm.registrantClub} onChange={e => setRegForm(p => ({ ...p, registrantClub: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Make</label>
                    <input value={regForm.vehicleMake} onChange={e => setRegForm(p => ({ ...p, vehicleMake: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Model</label>
                    <input value={regForm.vehicleModel} onChange={e => setRegForm(p => ({ ...p, vehicleModel: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Year</label>
                    <input type="number" value={regForm.vehicleYear} onChange={e => setRegForm(p => ({ ...p, vehicleYear: e.target.value }))} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">T-Shirt Size</label>
                  <select value={regForm.tShirtSize} onChange={e => setRegForm(p => ({ ...p, tShirtSize: e.target.value }))} className="input-field">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating…' : 'Create Registration'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Record Payment</h2>
                <button onClick={() => setShowPayModal(null)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-text">{showPayModal.vehicleID?.registrantID?.name}</p>
                <p className="text-xs text-text-muted">{showPayModal.vehicleID?.year} {showPayModal.vehicleID?.make} {showPayModal.vehicleID?.model}</p>
                <p className="text-xs text-text-faint">{showPayModal.eventID?.eventName}</p>
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
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Recording…' : 'Record Payment'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
