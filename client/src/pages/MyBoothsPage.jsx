import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineTruck } from 'react-icons/hi';

export default function MyBoothsPage() {
  const [data, setData] = useState({ vendor: null, booths: [] });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventID: '', boothNumber: '', amountPaid: 500, method: 'Card' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/vendors/my'), api.get('/events')])
      .then(([v, e]) => { setData(v.data); setEvents(e.data.filter(ev => ev.status === 'Open')); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vendors/event-vendors', {
        eventID: form.eventID,
        boothNumber: form.boothNumber,
        amountPaid: parseFloat(form.amountPaid)
      });
      // Create payment
      const ref = 'VB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      await api.post('/payments', {
        method: form.method,
        amount: parseFloat(form.amountPaid),
        transactionRef: ref,
        paymentType: 'vendor_booth'
      });
      toast.success('Booth booked successfully!');
      setShowModal(false);
      setForm({ eventID: '', boothNumber: '', amountPaid: 500, method: 'Card' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">My Booths</h1>
          <p className="text-sm text-text-muted mt-1">View assigned booths and apply for new ones</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Apply for Booth
        </button>
      </div>

      {data.booths.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineTruck className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">No booth assignments yet. Apply for a booth at an event!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.booths.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{b.eventID?.eventName}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {b.eventID?.date ? new Date(b.eventID.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                  <p className="text-xs text-text-faint mt-0.5">{b.eventID?.location}</p>
                </div>
                <span className={`badge ${b.eventID?.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}>{b.eventID?.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between bg-surface rounded-xl p-3">
                <div>
                  <p className="text-xs text-text-faint">Booth Number</p>
                  <p className="text-lg font-bold text-emerald-400">{b.boothNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-faint">Fee Paid</p>
                  <p className="text-lg font-bold text-brand">${b.amountPaid.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Apply for Booth</h2>
                <button onClick={() => setShowModal(false)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Event</label>
                  <select value={form.eventID} onChange={e => setForm(p => ({ ...p, eventID: e.target.value }))} className="input-field" required>
                    <option value="">Select event</option>
                    {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Preferred Booth Number</label>
                  <input value={form.boothNumber} onChange={e => setForm(p => ({ ...p, boothNumber: e.target.value }))} className="input-field" placeholder="e.g., A-01" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Booth Fee ($)</label>
                  <input type="number" value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: e.target.value }))} className="input-field" required min="1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Payment Method</label>
                  <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))} className="input-field">
                    {['Card', 'Cash', 'E-transfer', 'PayPal', 'Interac'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Processing…' : 'Book & Pay'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
