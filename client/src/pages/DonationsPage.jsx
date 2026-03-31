import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterEvent, setFilterEvent] = useState('');
  const [form, setForm] = useState({ eventID: '', donorName: '', donationType: 'Cash', estimatedValue: '' });

  const load = () => {
    Promise.all([api.get('/donations'), api.get('/events')])
      .then(([d, e]) => { setDonations(d.data); setEvents(e.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filterEvent ? donations.filter(d => d.eventID?._id === filterEvent) : donations;

  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/donations', { ...form, estimatedValue: Number(form.estimatedValue) }); toast.success('Donation recorded'); setShowModal(false); setForm({ eventID: '', donorName: '', donationType: 'Cash', estimatedValue: '' }); load(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleDelete = async (id) => { try { await api.delete(`/donations/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  const typeBadge = (t) => {
    const m = { Cash: 'badge-success', Item: 'badge-info', Service: 'badge-neutral', Vehicle: 'badge-warning' };
    return <span className={`badge ${m[t]}`}>{t}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Donations</h1><p className="text-sm text-text-muted mt-1">Track donations for events</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Donation</button>
      </div>

      <select className="input-field w-auto" value={filterEvent} onChange={e => setFilterEvent(e.target.value)}><option value="">All Events</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50"><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Donor</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Event</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Type</th><th className="text-right py-3 px-5 text-xs text-text-faint font-medium">Value</th><th className="py-3 px-5"></th></tr></thead>
          <tbody>{filtered.map((d, i) => <motion.tr key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/50 hover:bg-surface/30"><td className="py-3 px-5 text-text">{d.donorName}</td><td className="py-3 px-5 text-text-muted">{d.eventID?.eventName}</td><td className="py-3 px-5">{typeBadge(d.donationType)}</td><td className="py-3 px-5 text-right text-info font-medium">${d.estimatedValue?.toLocaleString()}</td><td className="py-3 px-5 text-right"><button onClick={() => handleDelete(d._id)} className="text-xs text-text-faint hover:text-danger transition-colors">Delete</button></td></motion.tr>)}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-text-faint text-center py-8">No donations</p>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-text mb-5">Add Donation</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-xs text-text-muted mb-1">Event</label><select className="input-field" value={form.eventID} onChange={e => setForm({ ...form, eventID: e.target.value })} required><option value="">Select</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select></div>
                <div><label className="block text-xs text-text-muted mb-1">Donor Name</label><input className="input-field" value={form.donorName} onChange={e => setForm({ ...form, donorName: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-text-muted mb-1">Type</label><select className="input-field" value={form.donationType} onChange={e => setForm({ ...form, donationType: e.target.value })}><option value="Cash">Cash</option><option value="Item">Item</option><option value="Service">Service</option><option value="Vehicle">Vehicle</option></select></div>
                  <div><label className="block text-xs text-text-muted mb-1">Value ($)</label><input type="number" className="input-field" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: e.target.value })} required /></div>
                </div>
                <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
