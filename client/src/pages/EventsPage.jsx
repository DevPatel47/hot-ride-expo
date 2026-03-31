import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventName: '', date: '', location: '', charityID: '', status: 'Open' });

  const load = () => {
    Promise.all([api.get('/events'), api.get('/charities')])
      .then(([e, c]) => { setEvents(e.data); setCharities(c.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
      await api.post('/events', { ...form, organizerID: user.id });
      toast.success('Event created');
      setShowModal(false);
      setForm({ eventName: '', date: '', location: '', charityID: '', status: 'Open' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try { await api.put(`/events/${id}`, { status }); toast.success(`Status updated`); load(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const statusBadge = (s) => {
    const m = { Open: 'badge-success', Closed: 'badge-neutral', Cancelled: 'badge-danger' };
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text">Events</h1><p className="text-sm text-text-muted mt-1">Manage expo events</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ New Event</button>
      </div>

      <div className="space-y-3">
        {events.map((ev, i) => (
          <motion.div key={ev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-text">{ev.eventName}</h3>
              <p className="text-sm text-text-muted mt-0.5">{ev.location} · {new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              {ev.charityID && <p className="text-xs text-info mt-1">Charity: {ev.charityID.charityName}</p>}
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(ev.status)}
              <select value={ev.status} onChange={e => updateStatus(ev._id, e.target.value)} className="input-field py-1.5 px-3 text-xs w-auto">
                <option value="Open">Open</option><option value="Closed">Closed</option><option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </motion.div>
        ))}
        {events.length === 0 && <p className="text-sm text-text-faint text-center py-8">No events yet</p>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-text mb-5">Create Event</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-xs text-text-muted mb-1">Event Name</label><input className="input-field" value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-text-muted mb-1">Date</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                  <div><label className="block text-xs text-text-muted mb-1">Charity</label><select className="input-field" value={form.charityID} onChange={e => setForm({ ...form, charityID: e.target.value })}><option value="">None</option>{charities.map(c => <option key={c._id} value={c._id}>{c.charityName}</option>)}</select></div>
                </div>
                <div><label className="block text-xs text-text-muted mb-1">Location</label><input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required /></div>
                <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Create</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
