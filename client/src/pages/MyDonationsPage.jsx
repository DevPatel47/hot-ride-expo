import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineHeart, HiOutlineDocumentText } from 'react-icons/hi';

export default function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [form, setForm] = useState({ eventID: '', donorName: '', donationType: 'Cash', description: '', estimatedValue: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/donations/my'), api.get('/events')])
      .then(([d, e]) => { setDonations(d.data); setEvents(e.data.filter(ev => ev.status === 'Open')); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/donations', form);
      toast.success('Donation submitted! Thank you for your generosity.');
      setShowModal(false);
      setShowReceipt(res.data);
      setForm({ eventID: '', donorName: '', donationType: 'Cash', description: '', estimatedValue: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const typeColors = { Cash: 'badge-success', Item: 'badge-info', Service: 'badge-warning', Vehicle: 'badge-danger' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">My Donations</h1>
          <p className="text-sm text-text-muted mt-1">Your donation history and receipts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> New Donation
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="card text-center py-16">
          <HiOutlineHeart className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">No donations yet. Make your first donation to support a great cause!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-text">{d.eventID?.eventName}</p>
                    <span className={`badge text-[10px] ${typeColors[d.donationType]}`}>{d.donationType}</span>
                  </div>
                  {d.description && <p className="text-xs text-text-muted">{d.description}</p>}
                  <p className="text-xs text-text-faint mt-1">{new Date(d.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-pink-400">${d.estimatedValue.toLocaleString()}</p>
                  {d.receiptNumber && (
                    <button onClick={() => setShowReceipt(d)} className="text-text-faint hover:text-brand transition-colors" title="View Receipt">
                      <HiOutlineDocumentText className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Donation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Make a Donation</h2>
                <button onClick={() => setShowModal(false)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Event</label>
                  <select value={form.eventID} onChange={e => setForm(p => ({ ...p, eventID: e.target.value }))} className="input-field" required>
                    <option value="">Select event</option>
                    {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Donor Name</label>
                    <input value={form.donorName} onChange={e => setForm(p => ({ ...p, donorName: e.target.value }))} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Type</label>
                    <select value={form.donationType} onChange={e => setForm(p => ({ ...p, donationType: e.target.value }))} className="input-field">
                      {['Cash', 'Item', 'Service', 'Vehicle'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Description (optional)</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="Brief description of the donation" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Estimated Value ($)</label>
                  <input type="number" value={form.estimatedValue} onChange={e => setForm(p => ({ ...p, estimatedValue: e.target.value }))} className="input-field" required min="1" step="0.01" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Submitting…' : 'Submit Donation'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Donation Receipt</h2>
                <button onClick={() => setShowReceipt(null)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <div className="bg-surface rounded-xl p-5 space-y-3">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center mx-auto mb-2">
                    <HiOutlineHeart className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-xs text-text-faint uppercase tracking-wider">Thank You!</p>
                </div>
                <div className="flex justify-between text-sm"><span className="text-text-faint">Receipt #</span><span className="text-text font-mono text-xs">{showReceipt.receiptNumber}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-faint">Event</span><span className="text-text">{showReceipt.eventID?.eventName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-faint">Donor</span><span className="text-text">{showReceipt.donorName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-faint">Type</span><span className="text-text">{showReceipt.donationType}</span></div>
                {showReceipt.description && <div className="flex justify-between text-sm"><span className="text-text-faint">Description</span><span className="text-text">{showReceipt.description}</span></div>}
                <hr className="border-border" />
                <div className="flex justify-between text-sm"><span className="text-text-faint">Value</span><span className="text-lg font-bold text-pink-400">${showReceipt.estimatedValue?.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-faint">Date</span><span className="text-text">{new Date(showReceipt.createdAt).toLocaleDateString()}</span></div>
              </div>
              <button onClick={() => setShowReceipt(null)} className="btn-secondary w-full mt-4">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
