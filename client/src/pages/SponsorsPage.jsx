import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [eventSponsors, setEventSponsors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [sForm, setSForm] = useState({ name: '', contactEmail: '', phone: '' });
  const [pForm, setPForm] = useState({ eventID: '', packageName: '', description: '', basePrice: '' });
  const [aForm, setAForm] = useState({ sponsorID: '', packageID: '', amountPaid: '' });

  const load = () => {
    Promise.all([api.get('/sponsors'), api.get('/sponsors/packages'), api.get('/sponsors/event-sponsors'), api.get('/events')])
      .then(([s, p, es, e]) => { setSponsors(s.data); setPackages(p.data); setEventSponsors(es.data); setEvents(e.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const sub = async (type, url, data, reset) => { try { await api.post(url, type === 'sponsor' ? data : { ...data, ...(data.basePrice ? { basePrice: Number(data.basePrice) } : {}), ...(data.amountPaid ? { amountPaid: Number(data.amountPaid) } : {}) }); toast.success('Saved'); setModal(null); reset(); load(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Sponsors</h1><p className="text-sm text-text-muted mt-1">Manage sponsors, packages & assignments</p></div>
        <div className="flex gap-2">
          <button onClick={() => setModal('sponsor')} className="btn-primary text-xs">+ Sponsor</button>
          <button onClick={() => setModal('package')} className="btn-secondary text-xs">+ Package</button>
          <button onClick={() => setModal('assign')} className="btn-secondary text-xs">+ Assign</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsors.map((s, i) => (
          <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card">
            <h3 className="text-base font-semibold text-text mb-1">{s.name}</h3>
            <p className="text-xs text-text-faint">{s.contactEmail} · {s.phone}</p>
          </motion.div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-text">Sponsor Assignments</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50"><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Sponsor</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Package</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Event</th><th className="text-right py-3 px-5 text-xs text-text-faint font-medium">Paid</th></tr></thead>
          <tbody>{eventSponsors.map((es, i) => <tr key={i} className="border-b border-border/50"><td className="py-3 px-5 text-text">{es.sponsorID?.name}</td><td className="py-3 px-5 text-text-muted">{es.packageID?.packageName}</td><td className="py-3 px-5 text-text-muted">{es.packageID?.eventID?.eventName}</td><td className="py-3 px-5 text-right text-brand font-medium">${es.amountPaid?.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
              {modal === 'sponsor' && <><h2 className="text-lg font-bold text-text mb-5">Add Sponsor</h2><form onSubmit={e => { e.preventDefault(); sub('sponsor', '/sponsors', sForm, () => setSForm({ name: '', contactEmail: '', phone: '' })); }} className="space-y-4"><div><label className="block text-xs text-text-muted mb-1">Name</label><input className="input-field" value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Email</label><input type="email" className="input-field" value={sForm.contactEmail} onChange={e => setSForm({ ...sForm, contactEmail: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Phone</label><input className="input-field" value={sForm.phone} onChange={e => setSForm({ ...sForm, phone: e.target.value })} required /></div><div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div></form></>}
              {modal === 'package' && <><h2 className="text-lg font-bold text-text mb-5">Create Package</h2><form onSubmit={e => { e.preventDefault(); sub('pkg', '/sponsors/packages', pForm, () => setPForm({ eventID: '', packageName: '', description: '', basePrice: '' })); }} className="space-y-4"><div><label className="block text-xs text-text-muted mb-1">Event</label><select className="input-field" value={pForm.eventID} onChange={e => setPForm({ ...pForm, eventID: e.target.value })} required><option value="">Select</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select></div><div><label className="block text-xs text-text-muted mb-1">Package Name</label><input className="input-field" value={pForm.packageName} onChange={e => setPForm({ ...pForm, packageName: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Description</label><input className="input-field" value={pForm.description} onChange={e => setPForm({ ...pForm, description: e.target.value })} /></div><div><label className="block text-xs text-text-muted mb-1">Base Price ($)</label><input type="number" className="input-field" value={pForm.basePrice} onChange={e => setPForm({ ...pForm, basePrice: e.target.value })} required /></div><div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Create</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div></form></>}
              {modal === 'assign' && <><h2 className="text-lg font-bold text-text mb-5">Assign Sponsor</h2><form onSubmit={e => { e.preventDefault(); sub('assign', '/sponsors/event-sponsors', aForm, () => setAForm({ sponsorID: '', packageID: '', amountPaid: '' })); }} className="space-y-4"><div><label className="block text-xs text-text-muted mb-1">Sponsor</label><select className="input-field" value={aForm.sponsorID} onChange={e => setAForm({ ...aForm, sponsorID: e.target.value })} required><option value="">Select</option>{sponsors.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div><div><label className="block text-xs text-text-muted mb-1">Package</label><select className="input-field" value={aForm.packageID} onChange={e => setAForm({ ...aForm, packageID: e.target.value })} required><option value="">Select</option>{packages.map(p => <option key={p._id} value={p._id}>{p.packageName} — ${p.basePrice}</option>)}</select></div><div><label className="block text-xs text-text-muted mb-1">Amount ($)</label><input type="number" className="input-field" value={aForm.amountPaid} onChange={e => setAForm({ ...aForm, amountPaid: e.target.value })} required /></div><div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Assign</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div></form></>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
