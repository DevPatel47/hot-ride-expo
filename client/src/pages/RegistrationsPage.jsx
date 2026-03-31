import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrants, setRegistrants] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'register' | 'registrant' | 'vehicle'
  const [filterEvent, setFilterEvent] = useState('');
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', club: '' });
  const [vehForm, setVehForm] = useState({ registrantID: '', make: '', model: '', year: '' });
  const [form, setForm] = useState({ eventID: '', vehicleID: '', tShirtSize: 'L' });

  const load = () => {
    Promise.all([api.get('/registrations'), api.get('/events'), api.get('/registrants'), api.get('/registrants/vehicles')])
      .then(([r, e, reg, v]) => { setRegistrations(r.data); setEvents(e.data); setRegistrants(reg.data); setVehicles(v.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filterEvent ? registrations.filter(r => r.eventID?._id === filterEvent) : registrations;

  const submit = async (type, data, reset) => {
    try {
      if (type === 'registrant') await api.post('/registrants', data);
      else if (type === 'vehicle') await api.post('/registrants/vehicles', data);
      else await api.post('/registrations', data);
      toast.success(type === 'register' ? 'Registration created' : `${type.charAt(0).toUpperCase() + type.slice(1)} added`);
      setModal(null); reset(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statusBadge = (s) => {
    const m = { Pending: 'badge-warning', Confirmed: 'badge-success', Cancelled: 'badge-danger' };
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Registrations</h1><p className="text-sm text-text-muted mt-1">Vehicle registrations for events</p></div>
        <div className="flex gap-2">
          <button onClick={() => setModal('registrant')} className="btn-secondary text-xs">+ Registrant</button>
          <button onClick={() => setModal('vehicle')} className="btn-secondary text-xs">+ Vehicle</button>
          <button onClick={() => setModal('register')} className="btn-primary text-xs">+ Register</button>
        </div>
      </div>

      <select className="input-field w-auto" value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
        <option value="">All Events</option>
        {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}
      </select>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50">
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Registrant</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Vehicle</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Event</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">T-Shirt</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/50 hover:bg-surface/30">
                <td className="py-3 px-5"><p className="text-text font-medium">{r.vehicleID?.registrantID?.name || '—'}</p><p className="text-xs text-text-faint">{r.vehicleID?.registrantID?.email}</p></td>
                <td className="py-3 px-5 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td>
                <td className="py-3 px-5 text-text-muted">{r.eventID?.eventName}</td>
                <td className="py-3 px-5 text-text-muted">{r.tShirtSize}</td>
                <td className="py-3 px-5">{statusBadge(r.registrationStatus)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-text-faint text-center py-8">No registrations found</p>}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>

              {modal === 'registrant' && (<>
                <h2 className="text-lg font-bold text-text mb-5">Add Registrant</h2>
                <form onSubmit={e => { e.preventDefault(); submit('registrant', regForm, () => setRegForm({ name: '', email: '', phone: '', club: '' })); }} className="space-y-4">
                  <div><label className="block text-xs text-text-muted mb-1">Name</label><input className="input-field" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs text-text-muted mb-1">Email</label><input type="email" className="input-field" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required /></div>
                    <div><label className="block text-xs text-text-muted mb-1">Phone</label><input className="input-field" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required /></div>
                  </div>
                  <div><label className="block text-xs text-text-muted mb-1">Club (optional)</label><input className="input-field" value={regForm.club} onChange={e => setRegForm({ ...regForm, club: e.target.value })} /></div>
                  <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div>
                </form>
              </>)}

              {modal === 'vehicle' && (<>
                <h2 className="text-lg font-bold text-text mb-5">Add Vehicle</h2>
                <form onSubmit={e => { e.preventDefault(); submit('vehicle', vehForm, () => setVehForm({ registrantID: '', make: '', model: '', year: '' })); }} className="space-y-4">
                  <div><label className="block text-xs text-text-muted mb-1">Owner</label><select className="input-field" value={vehForm.registrantID} onChange={e => setVehForm({ ...vehForm, registrantID: e.target.value })} required><option value="">Select registrant</option>{registrants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}</select></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-xs text-text-muted mb-1">Make</label><input className="input-field" value={vehForm.make} onChange={e => setVehForm({ ...vehForm, make: e.target.value })} required /></div>
                    <div><label className="block text-xs text-text-muted mb-1">Model</label><input className="input-field" value={vehForm.model} onChange={e => setVehForm({ ...vehForm, model: e.target.value })} required /></div>
                    <div><label className="block text-xs text-text-muted mb-1">Year</label><input type="number" className="input-field" value={vehForm.year} onChange={e => setVehForm({ ...vehForm, year: e.target.value })} required /></div>
                  </div>
                  <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div>
                </form>
              </>)}

              {modal === 'register' && (<>
                <h2 className="text-lg font-bold text-text mb-5">New Registration</h2>
                <form onSubmit={e => { e.preventDefault(); submit('register', form, () => setForm({ eventID: '', vehicleID: '', tShirtSize: 'L' })); }} className="space-y-4">
                  <div><label className="block text-xs text-text-muted mb-1">Event</label><select className="input-field" value={form.eventID} onChange={e => setForm({ ...form, eventID: e.target.value })} required><option value="">Select event</option>{events.filter(e => e.status === 'Open').map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select></div>
                  <div><label className="block text-xs text-text-muted mb-1">Vehicle</label><select className="input-field" value={form.vehicleID} onChange={e => setForm({ ...form, vehicleID: e.target.value })} required><option value="">Select vehicle</option>{vehicles.map(v => <option key={v._id} value={v._id}>{v.registrantID?.name} — {v.year} {v.make} {v.model}</option>)}</select></div>
                  <div><label className="block text-xs text-text-muted mb-1">T-Shirt Size</label><select className="input-field" value={form.tShirtSize} onChange={e => setForm({ ...form, tShirtSize: e.target.value })}>{['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Register</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div>
                </form>
              </>)}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
